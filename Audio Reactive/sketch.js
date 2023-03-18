let sound, amplitude;

function preload() {
    sound = loadSound('test1.mp3');
}
function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.mouseClicked(togglePlay);
    amplitude = new p5.Amplitude();
    fft = new p5.FFT();
}

function draw() {
    background(220);

    let level = amplitude.getLevel();
    let size = map(level, 0, 1, 0, 200);
    ellipse(width / 2, height / 2, size, size);


    let spectrum = fft.analyze();
    noStroke();
    fill(255, 0, 255);
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, 0, width);
        let h = -height + map(spectrum[i], 0, 255, height, 0);
        rect(x, height, width / spectrum.length, h)
    }

    let waveform = fft.waveform();
    noFill();
    beginShape();
    stroke(20);
    for (let i = 0; i < waveform.length; i++) {
        let x = map(i, 0, waveform.length, 0, width);
        let y = map(waveform[i], -1, 1, 0, height);
        vertex(x, y);
    }
    endShape();
}

function togglePlay() {
    if (sound.isPlaying()) {
        sound.pause();
    } else {
        sound.loop();
        amplitude = new p5.Amplitude();
        amplitude.setInput(sound);
    }
}