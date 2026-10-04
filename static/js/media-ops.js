function bufferToWave(abuffer, len) {
    let numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        out = new DataView(new ArrayBuffer(length)),
        channels = [], i, sample, offset = 0, pos = 0;

    function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66);
    setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16);
    setUint32(0x61746164); setUint32(length - pos - 4);

    for (i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            out.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    return out.buffer;
}

async function convertImageFile(file, targetFormat) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas conversion failed'));
            }, targetFormat);
        };
        img.onerror = () => reject(new Error('Image loading failed'));
    });
}

async function executeMediaConversion() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) {
        alert('Please select a file first.');
        return;
    }

    const file = input.files[0];
    const targetFormatVal = document.getElementById('target-format').value;
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status-text');
    const timeLeft = document.getElementById('time-left');

    statusText.innerText = 'Processing...';
    progressBar.style.width = '20%';
    timeLeft.innerText = 'Time left: ~00:02';

    try {
        if (file.type.startsWith('image/')) {
            progressBar.style.width = '60%';
            const convertedBlob = await convertImageFile(file, targetFormatVal);
            
            progressBar.style.width = '100%';
            statusText.innerText = 'Completed';
            timeLeft.innerText = 'Time left: 00:00';
            
            const ext = targetFormatVal.split('/')[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
            downloadBlob(convertedBlob, `deluxe_converted_${Date.now()}.${ext}`);
        } else {
            const arrayBuffer = await file.arrayBuffer();
            progressBar.style.width = '50%';
            
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            progressBar.style.width = '80%';

            
            const wavBuffer = bufferToWave(audioBuffer, audioBuffer.length);
            const blob = new Blob([wavBuffer], { type: 'audio/wav' });

            progressBar.style.width = '100%';
            statusText.innerText = 'Completed';
            timeLeft.innerText = 'Time left: 00:00';

            const ext = targetFormatVal.split('/')[1] || 'wav';
            downloadBlob(blob, `deluxe_converted_${Date.now()}.${ext}`);
        }
    } catch (err) {
        statusText.innerText = 'Error';
        timeLeft.innerText = 'Time left: Failed';
        alert('Conversion failed: ' + err.message);
    }
}

function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}