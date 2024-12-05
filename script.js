// Get the DOM elements
const profilePicInput = document.getElementById('profilePicInput');
const audioInput = document.getElementById('audioInput');
const backgroundInput = document.getElementById('backgroundInput');
const blurInput = document.getElementById('blurInput');
const blurValue = document.getElementById('blurValue');
const background = document.getElementById('background');
const centerImage = document.getElementById('centerImage');
const audioVisualizer = document.getElementById('audioVisualizer');

// Audio context and visualizer setup
let audioContext, analyser, bufferLength, dataArray;

// Set up the canvas context
const canvasCtx = audioVisualizer.getContext('2d');

// Update the blur value as the slider changes
blurInput.addEventListener('input', function() {
    const blurAmount = blurInput.value;
    blurValue.textContent = `${blurAmount}px`;
    background.style.filter = `blur(${blurAmount}px)`;
});

// Handle Profile Picture upload
profilePicInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            centerImage.style.backgroundImage = `url(${e.target.result})`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle Background Image upload
backgroundInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            background.style.backgroundImage = `url(${e.target.result})`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle Audio file upload and setup visualizer
audioInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const audio = new Audio(URL.createObjectURL(file));
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        audio.src = URL.createObjectURL(file);

        // Set up the audio analyzer
        audio.onplay = function() {
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            // Start visualizing the audio
            drawVisualizer();
        };

        audio.play();
    }
});

// Function to draw the audio visualizer
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
