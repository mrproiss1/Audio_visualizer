// Get the DOM elements
const profilePicInput = document.getElementById('profilePicInput');
const audioInput = document.getElementById('audioInput');
const backgroundInput = document.getElementById('backgroundInput');
const blurInput = document.getElementById('blurInput');
const blurValue = document.getElementById('blurValue');
const profilePicSize = document.getElementById('profilePicSize');
const profilePicSizeValue = document.getElementById('profilePicSizeValue');
const background = document.getElementById('background');
const centerImage = document.getElementById('centerImage');
const audioVisualizer = document.getElementById('audioVisualizer');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const unpauseButton = document.getElementById('unpauseButton');
const downloadButton = document.getElementById('downloadButton');
const previewContainer = document.getElementById('previewContainer');
const preview = document.getElementById('preview');

// Audio context and visualizer setup
let audioContext, analyser, bufferLength, dataArray, audio;
let audioSource, isPaused = false;

// Set up the canvas context
const canvasCtx = audioVisualizer.getContext('2d');

// Update the blur value as the slider changes
blurInput.addEventListener('input', function () {
    const blurAmount = blurInput.value;
    blurValue.textContent = `${blurAmount}px`;
    background.style.filter = `blur(${blurAmount}px)`;
});

// Handle Profile Picture upload
let profilePicFile;
profilePicInput.addEventListener('change', function (event) {
    profilePicFile = event.target.files[0];
    // Preview the profile picture
    const reader = new FileReader();
    reader.onload = function (e) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Profile Picture">`;
    };
    reader.readAsDataURL(profilePicFile);
});

// Handle Background Image upload
let backgroundFile;
backgroundInput.addEventListener('change', function (event) {
    backgroundFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        background.style.backgroundImage = `url(${e.target.result})`;
    };
    reader.readAsDataURL(backgroundFile);
});

// Handle Audio file upload
let audioFile;
audioInput.addEventListener('change', function (event) {
    audioFile = event.target.files[0];
});

// Handle Profile Picture Size change
profilePicSize.addEventListener('input', function () {
    const size = profilePicSize.value;
    profilePicSizeValue.textContent = `${size}px`;
    centerImage.style.width = `${size}px`;
    centerImage.style.height = `${size}px`;
});

// Handle Start Button click to load and start visualizer
startButton.addEventListener('click', function () {
    if (profilePicFile && audioFile && backgroundFile) {
        // Display visualizer and hide the upload section
        previewContainer.style.display = 'none';
        document.querySelector('.upload-container').style.display = 'none';
        document.querySelector('.visualizer').style.display = 'block';

        // Set background image
        const backgroundReader = new FileReader();
        backgroundReader.onload = function (e) {
            background.style.backgroundImage = `url(${e.target.result})`;
        };
        backgroundReader.readAsDataURL(backgroundFile);

        // Set profile picture in center
        const profilePicReader = new FileReader();
        profilePicReader.onload = function (e) {
            centerImage.style.backgroundImage = `url(${e.target.result})`;
        };
        profilePicReader.readAsDataURL(profilePicFile);

        // Set up the audio visualizer
        audio = new Audio(URL.createObjectURL(audioFile));
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        audio.src = URL.createObjectURL(audioFile);

        audio.onplay = function () {
            audioSource = audioContext.createMediaElementSource(audio);
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);

            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            audio.play();
            drawVisualizer();
        };

        // Start audio
        audio.play();
    } else {
        alert('Please upload all files: Profile Picture, Audio, and Background Image');
    }
});

// Draw the audio visualizer
function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.clearRect(0, 0, audioVisualizer.width, audioVisualizer.height);

    const barWidth = audioVisualizer.width / bufferLength;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        canvasCtx.fillRect(x, audioVisualizer.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}

// Pause/Unpause buttons
pauseButton.addEventListener('click', function () {
    audio.pause();
    isPaused = true;
    pauseButton.style.display = 'none';
    unpauseButton.style.display = 'inline-block';
});

unpauseButton.addEventListener('click', function () {
    audio.play();
    isPaused = false;
    unpauseButton.style.display = 'none';
    pauseButton.style.display = 'inline-block';
});

// Placeholder for the download button (you need to implement the download functionality separately)
downloadButton.addEventListener('click', function () {
    alert('Download option not implemented yet.');
});
