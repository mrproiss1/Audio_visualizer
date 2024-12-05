const audioFileInput = document.getElementById('audio-file');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

let audioContext;
let analyser;
let sourceNode;

audioFileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function() {
            const audioData = reader.result;
            playAudio(audioData);
        };
        reader.readAsArrayBuffer(file);
    }
}

function playAudio(audioData) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    
    audioContext.decodeAudioData(audioData, function(buffer) {
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceNode.start(0);
        visualize();
    });
}

function visualize() {
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const frames = [];  // To store the frames as images

    function draw() {
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
            x += barWidth + 1;
        }

        // Capture the canvas as an image every frame
        const imageData = canvas.toDataURL("image/png");
        frames.push(imageData);

        if (audioContext.state === 'running') {
            requestAnimationFrame(draw);
        } else {
            // Audio finished, generate video from frames (can use FFmpeg)
            generateVideoFromFrames(frames);
        }
    }

    draw();
}

function generateVideoFromFrames(frames) {
    // Here you can implement logic to send frames to a server or 
    // generate the video using tools like FFmpeg (not possible in the browser)
    console.log("Frames captured:", frames);
    alert("Video rendering is not supported in browser. Use FFmpeg to combine images.");
}
