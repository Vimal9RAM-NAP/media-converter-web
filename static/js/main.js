let activeMode = 'audio';

const fileInput = document.getElementById('file-input');
const fileLabel = document.getElementById('file-label');
const fileSublabel = document.getElementById('file-sublabel');
const dropZone = document.getElementById('drop-zone');
const targetFormat = document.getElementById('target-format');

const videoPreview = document.getElementById('video-preview');
const audioPreview = document.getElementById('audio-preview');
const previewPlaceholder = document.getElementById('preview-placeholder');
const showcaseTitle = document.getElementById('showcase-title');
const metaInfo = document.getElementById('meta-info');


const formatOptions = {
    audio: [
        { label: 'MP3 Audio (.mp3)', value: 'audio/mp3' },
        { label: 'WAV Uncompressed (.wav)', value: 'audio/wav' },
        { label: 'OGG Vorbis (.ogg)', value: 'audio/ogg' },
        { label: 'AAC Audio (.aac)', value: 'audio/aac' },
        { label: 'FLAC Lossless (.flac)', value: 'audio/flac' },
        { label: 'WebM Audio (.webm)', value: 'audio/webm' }
    ],
    video: [
        { label: 'MP4 Video (.mp4)', value: 'video/mp4' },
        { label: 'WebM Video (.webm)', value: 'video/webm' },
        { label: 'Animated GIF (.gif)', value: 'image/gif' },
        { label: 'WAV Audio Stream (.wav)', value: 'audio/wav' },
        { label: 'MP3 Audio Stream (.mp3)', value: 'audio/mp3' }
    ],
    image: [
        { label: 'PNG Image (.png)', value: 'image/png' },
        { label: 'JPEG Image (.jpg)', value: 'image/jpeg' },
        { label: 'WebP Image (.webp)', value: 'image/webp' },
        { label: 'SVG Vector (.svg)', value: 'image/svg+xml' }
    ]
};

function populateTargetOptions(category) {
    targetFormat.innerHTML = '';
    const options = formatOptions[category] || formatOptions.audio;
    
    options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        targetFormat.appendChild(optionEl);
    });
}

function switchMode(mode) {
    activeMode = mode;
    ['audio', 'vid2gif', 'extract'].forEach(m => {
        const btn = document.getElementById(`mode-${m}-btn`);
        if (btn) {
            if (m === mode) {
                btn.className = 'w-full text-left px-3 py-2.5 rounded-lg border border-[#22c55e] text-[#22c55e] bg-[#22c55e]/5 transition-all';
            } else {
                btn.className = 'w-full text-left px-3 py-2.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all';
            }
        }
    });

    if (mode === 'audio') {
        fileInput.accept = 'audio/*';
        fileSublabel.innerText = 'Supports MP3, WAV, OGG, AAC, FLAC';
        populateTargetOptions('audio');
    } else if (mode === 'vid2gif') {
        fileInput.accept = 'video/*,image/*';
        fileSublabel.innerText = 'Select MP4, WebM, or Image file';
        populateTargetOptions('video');
    } else if (mode === 'extract') {
        fileInput.accept = 'video/*';
        fileSublabel.innerText = 'Extract audio stream from video';
        populateTargetOptions('audio');
    }
}

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileLabel.innerText = file.name;
    showcaseTitle.innerText = file.name;
    metaInfo.innerText = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const url = URL.createObjectURL(file);
    previewPlaceholder.classList.add('hidden');

   
    if (file.type.startsWith('video/')) {
        videoPreview.src = url;
        videoPreview.classList.remove('hidden');
        audioPreview.classList.add('hidden');
        populateTargetOptions('video');
    } else if (file.type.startsWith('image/')) {
        videoPreview.classList.add('hidden');
        audioPreview.classList.add('hidden');
        previewPlaceholder.innerHTML = `<img src="${url}" class="w-full h-full object-cover rounded-md"/>`;
        previewPlaceholder.classList.remove('hidden');
        populateTargetOptions('image');
    } else {
        audioPreview.src = url;
        audioPreview.classList.remove('hidden');
        videoPreview.classList.add('hidden');
        populateTargetOptions('audio');
    }
});


['dragenter', 'dragover'].forEach(eName => {
    dropZone.addEventListener(eName, (e) => {
        e.preventDefault();
        dropZone.classList.add('dropzone-active');
    });
});

['dragleave', 'drop'].forEach(eName => {
    dropZone.addEventListener(eName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('dropzone-active');
    });
});

dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
    }
});


populateTargetOptions('audio');