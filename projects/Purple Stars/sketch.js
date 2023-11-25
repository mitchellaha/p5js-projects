let showFirstClickInfo = true;
let showSoundInfo = false;
let botchedMode = false;
let reallybotchedMode = false;
let eyeMode = false;
let centerToggle = true;
let fpsToggle = false;
let shootingStarToggle = true;
let regularStarToggle = true;
let levelMultiplierSlider;
let levelMultiplier = 100;
let flaresOn = false;
let flareAlpha = 2;
let ringStretch = 3;
let usingMic = false;
let enableBackground = true;
let jumpystars = false;

// Performance toggles
let halfInnerViz = true;
let halfOuterViz = true;

let starCount;  // ? This is assigned based on the window width
let starCountMultiplier = 0.5;
let shootingStarCount;

let canvas;
let sound
let amplitude
let fft;
let level;
let spectrum;
let waveform;

let currTime = 0;
let dropTime = 0;
let beat = 0;   // ? Isnt Used Yet
let bpm = 140;  // ? Isnt Used Yet


let stars = [];
let flares = [];
let shootingStars = []


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const purpleToRedColorShift = (level) => {
    let red = 255;
    let green = 0;
    let blue = 255;
    if (level < 25) {
        red = 255;
        green = map(level, 0, 50, 0, 255);
        blue = 255;
    } else {
        red = map(level, 50, 100, 255, 0);
        green = 255;
        blue = 255;
    }
    return [red, green, blue];
};




const starEffector = {
    levels: [
        {
            level: 0,
            name: "Purple",
            color: [255, 0, 255]
        },
        {
            level: 1,
            name: "Blue",
            color: [0, 0, 255]
        },
        {
            level: 2,
            name: "Cyan",
            color: [0, 255, 255]
        },
        {
            level: 3,
            name: "Green",
            color: [0, 255, 0]
        },
        {
            level: 4,
            name: "Yellow",
            color: [255, 255, 0]
        },
        {
            level: 5,
            name: "White",
            color: [255, 255, 255]
        },
        {
            level: 6,
            name: "Red",
            color: [255, 0, 0]
        }
    ],
    getLevel(level) {
        for (let i = 0; i < starEffector.levels.length; i++) {
            if (starEffector.levels[i].level === level) {
                return starEffector.levels[i];
            }
        }
        return null;
    },
    
    handleColorEffector(effectorNum, initalRed, initalGreen, initalBlue) {
        let red = initalRed;
        let green = initalGreen;
        let blue = initalBlue;
        let effectorColors = [255, 255, 255];
        if (effectorNum >= 0 && effectorNum < starEffector.levels.length) {
            effectorColors = starEffector.levels[effectorNum].color;
        }
        // find a good looking midpoint between the current color and the effector color
        red = (red + effectorColors[0]) / 2;
        green = (green + effectorColors[1]) / 2;
        blue = (blue + effectorColors[2]) / 2;
        return [red, green, blue];
    }
}

const soundObj = {
    preloadCallback: function() {
        console.log(input)
        soundObj.togglePlay();
        console.log("sound loaded");
        sound.setVolume(0.5);
    },

    togglePlay() {
        if (sound.isPlaying()) {
            sound.pause();
        } else {
            sound.loop();
            amplitude = new p5.Amplitude();
            amplitude.setInput(sound);
        }
    },

    enableMicInput() {
        userStartAudio();
        sound = new p5.AudioIn();
        sound.start();
        amplitude = new p5.Amplitude();
        amplitude.setInput(sound);
    },

    addSoundFeatures() {
        if (!sound.isPlaying()) {
            return;
        }
        soundObj.drawSpectrum();
        // soundObj.drawCircleWaveform();
        // soundObj.drawLevel();
    },

    drawSpectrum() {
        noStroke();
        fill(255, 0, 255);
        for (let i = 0; i < spectrum.length; i++) {
            let x = map(i, 0, spectrum.length, 0, width);
            let h = -height + map(spectrum[i], 0, 255, height, 0);
            rect(x, height, width / spectrum.length, h)
        }
    },

    drawRegularWaveform() {
        // * Across the middle straigt wave
        noFill();
        beginShape();
        stroke("#FF00FF");
        for (let i = 0; i < waveform.length; i++) {
            let x = map(i, 0, waveform.length, 0, width);
            let y = map(waveform[i], -1, 1, 0, height);
            vertex(x, y);
        }
        endShape();
    },

    drawCornerWaveforms() {
        // Draws Circle Waveform in the corners
        noFill();
        stroke("#FF00FF");
        let diameter = map(level * 2, 0, 1, 0, 100);
        let radius = diameter / 2;
        let currentDegreeDirection = 1;
        const getRandomLocationInCircle = (radius) => {
            let r = random(0, radius);
            let theta = random(0, TAU);
            let x = r * cos(theta);
            let y = r * sin(theta);
            return [x, y];
        }
        let corners = [
            [0, 0],
            [width, 0],
            [width, height],
            [0, height]
        ]
        // TODO: Maybe add a toggle for this. Its pretty cool
        // shift corners closer to the center of the screen
        // corners = corners.map((corner) => {
        //     let x = corner[0];
        //     let y = corner[1];
        //     let xShift = width / 4;
        //     let yShift = height / 4;
        //     if (x < width / 2) {
        //         x += xShift;
        //     } else {
        //         x -= xShift;
        //     }
        //     if (y < height / 2) {
        //         y += yShift;
        //     } else {
        //         y -= yShift;
        //     }
        //     return [x, y];
        // });
        for (let j = 0; j < corners.length; j++) {
            beginShape();
            currentDegreeDirection = 1;
            for (let i = 0; i < waveform.length / (halfOuterViz ? 20 : 1); i++) {
                let xRadius = radius;
                let yRadius = radius;
                if (!botchedMode) {
                    [xRadius, yRadius] = getRandomLocationInCircle(radius);
                }
                let stretchFactorMin = 0;
                let stretchFactorMax = 0.5;
                if (reallybotchedMode) {
                    stretchFactorMin = -5;
                    stretchFactorMax = 5;
                }
                let circleFlex = map(waveform[i], -1, 1, stretchFactorMin, stretchFactorMax);
                // console.log(circleFlex)
                // center of circle
                let x = corners[j][0];
                let y = corners[j][1];
                // get the x and y points on the circle
                let x1 = x + xRadius * cos(currentDegreeDirection) * circleFlex;
                let y1 = y + yRadius * sin(currentDegreeDirection) * circleFlex;
                // set random color
                stroke(random(255), random(255), random(255));
                // set the stroke weight
                // strokeWeight(10);
                // set the vertex
                vertex(x1, y1);
                // increment the degree direction
                currentDegreeDirection += 1;
            }
            currentDegreeDirection = 1;
            endShape();
        }
    },

    drawCircleWaveform() {
        // * Circle in the middle wave
        noFill();
        beginShape();
        stroke("#FF00FF");
        let randomInLevel = random(level/ringStretch, level);
        let diameter = map(randomInLevel, 0, 1, 0, 100);
        let radius = diameter / 2;
        let currentDegreeDirection = 1;
        const getRandomLocationInCircle = (radius) => {
            let r = random(0, radius);
            let theta = random(0, TAU);
            let x = r * cos(theta);
            let y = r * sin(theta);
            return [x, y];
        }
        const randomWaveForm = () => floor(random(0, waveform.length));
        for (let i = 0; i < waveform.length / (halfInnerViz ? 2 : 1); i++) {
            let xRadius = radius;
            let yRadius = radius;
            if (botchedMode) {
                [xRadius, yRadius] = getRandomLocationInCircle(radius);
            }
            let stretchFactorMin = 0;
            let stretchFactorMax = 0.5;
            if (reallybotchedMode) {
                stretchFactorMin = -5;
                stretchFactorMax = 5;
            }
            let waveFormInt = randomWaveForm();
            let circleFlex = map(waveform[waveFormInt], -1, 1, stretchFactorMin, stretchFactorMax);
            // console.log(circleFlex)
            // center of circle
            let x = width / 2;
            let y = height / 2;
            // get the x and y points on the circle
            let x1 = x + xRadius * cos(currentDegreeDirection) * circleFlex;
            let y1 = y + yRadius * sin(currentDegreeDirection) * circleFlex;
            // set random color
            stroke(random(255), random(255), random(255));
            // set the stroke weight
            // strokeWeight(10);
            // set the vertex
            vertex(x1, y1);
            // increment the degree direction
            currentDegreeDirection += 1;
        }
        endShape();

    },

    drawLevel() {
        let size = map(level, 0, 1, 0, 200);
        stroke("#FF00FF");
        ellipse(width / 2, height / 2, size, size);
    }
}

let lastFrameWrite = 0;
let currFrameRate = 0;
const textWriter = {
    writeText(x, y, string) {
        fill(255, 255, 255);
        textSize(15);
        textAlign(LEFT, CENTER);
        text(string, x, y);
    },

    writeTextCentered(x, y, string) {
        fill(255, 255, 255);
        textSize(32);
        textAlign(CENTER, CENTER);
        text(string, x, y);
    },

    writeInfo() {
        if (!showFirstClickInfo) {
            return;
        }
        textWriter.writeTextCentered(width / 2, height / 2, "upload your own song");
    },

    hideFirstClick() {
        showFirstClickInfo = false;
    },

    writeFps() {
        // Add Background
        fill(255, 0, 0, 255);
        rect(width/2, 0, 60, 20);
        if (lastFrameWrite > 15) {
            let frameRateInt = frameRate().toFixed(0);
            textWriter.writeText(width/2, 10, `FPS: ${frameRateInt}`);
            lastFrameWrite = 0;
            currFrameRate = frameRateInt;
        } else {
            textWriter.writeText(width/2, 10, `FPS: ${currFrameRate}`);
            lastFrameWrite += 1;
        }
    },

    writeSoundInfo() {
        if (!showSoundInfo) {
            return;
        }
        // Add Background
        fill(0, 0, 0, 255);
        rect(width-255, 0, 255, 600);
        if (!sound) {
            return;
        }
        // let currentRefreshRate = frameRate();
        // textWriter.writeText(10, 110, `Refresh Rate: ${currentRefreshRate}`);
        // let waveformCount = fft.waveform().length;
        // textWriter.writeText(10, 130, `Waveform Count: ${waveformCount}`);
        textWriter.writeText(width-250, 10, `Level: ${level}`);
        textWriter.writeText(width-250, 30, `Time: ${String(round(sound.currentTime()))} / ${String(round(sound.duration()))}`);
        textWriter.writeText(width-250, 50, `Amplitude: ${amplitude.getLevel()}`);

        // write modes
        textWriter.writeText(width-250, 70, `Flares On: ${flaresOn}`);
        textWriter.writeText(width-250, 90, `Botched Mode: ${botchedMode}`);
        textWriter.writeText(width-250, 110, `Really Botched Mode: ${reallybotchedMode}`);
        textWriter.writeText(width-250, 130, `Eye Mode: ${eyeMode}`);
        textWriter.writeText(width-250, 150, `Center Toggle: ${centerToggle}`);
        textWriter.writeText(width-250, 170, `Half Inner: ${halfInnerViz}`);
        textWriter.writeText(width-250, 190, `Half Outer: ${halfOuterViz}`);

        // write counts
        textWriter.writeText(width-250, 210, `Star Count: ${starCount}`);
        textWriter.writeText(width-250, 230, `Shooting Star Count: ${shootingStarCount}`);
        textWriter.writeText(width-250, 250, `Level Multiplier: ${levelMultiplier}`);

        // Add Background for big ones
        fill(0, 0, 0, 255);
        rect(0, height-35, width, 30);
        // Write Big Ones
        textWriter.writeText(10, height-10, `FFT: ${fft.analyze()}`);
        textWriter.writeText(10, height-25, `Waveform: ${fft.waveform()}`);

        // ! Keep this off. It causes lag
        // // draw the temp waveform
        // for (var i = 0; i < waveformCount; i++) {
        //     let x = map(i, 0, waveformCount, 0, 300);
        //     let y = map(waveform[i], -1, 1, 0, 200);
        //     stroke(255, 0, 255);
        //     line(x, 600, x, 500 - y);
        // }
        // fill(0, 0, 0, 0);

    }
}





class Star {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.size = random(0.25, 3);
        this.t = random(TAU);
        this.first = random(100, 255);
        this.second = random(0,100);
        this.third = random(50,255);
        this.colorEffectorLevel = getRandomInt(starEffector.levels.length);
    }

    draw() {
        this.t += 0.1;
        var scale = this.size + sin(this.t) * 2;
        noStroke();
        // let [red, green, blue] = purpleToRedColorShift(level);
        let [red, green, blue] = starEffector.handleColorEffector(this.colorEffectorLevel.level, this.first, this.second, this.third);
        fill(red, green, blue, 255);
        // fill(this.first, this.second, this.third);
        ellipse(this.x, this.y, scale, scale);
        return scale
    }
}

class Flare {
    constructor(x, y, w, h, size) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.size = size;
        this.firstColor = random(100, 195);
        this.secondColor = random(0,75);
        this.thirdColor = random(100,255);
    }

    draw(nScale) {
        noStroke();
        fill(this.firstColor, this.secondColor, this.thirdColor, flareAlpha);
        for (var i = 0; i < nScale * 2; i++) {
            ellipse(this.x, this.y, i * nScale * random(1, 1.75));
        }
    }
}

class ShootingStar { 
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.size = random(0.25, 3);
        this.t = random(TAU*120);
        this.first = random(100, 255);
        this.second = random(0,100);
        this.third = random(50,255);
        this.effectorLevel = getRandomInt(starEffector.levels.length);
        this.doEffector = getRandomInt(2);
    }

    draw() {
        this.x = map(noise(this.t), 0, 1, this.x - 1, this.x + 1);
        this.y = map(noise(this.t + 200), 0, 1, this.y - 1, this.y + 1);
        this.t += 0.01;
        // if the star goes off the screen, reset it to a random position
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.x = random(width);
            this.y = random(height);
        }


        // ! Keep Around, Eh
        if (jumpystars) {
            this.x += random(-5, 5);
            this.y += random(-5, 5);
            this.t += 10;
        }


        var scale = this.size + sin(this.t) * 2;

        noStroke();
        if (this.doEffector === 1) {
            let newEffectorLevel = getRandomInt(starEffector.levels.length);
            let [red, green, blue] = starEffector.handleColorEffector(newEffectorLevel, this.first, this.second, this.third);
            fill(red, green, blue, 255);
        } else {
            fill(255, 255, level*25, 255);
        }
        ellipse(this.x, this.y, scale, scale);
    }
}

// class CenterPerlinNoiseCircle {
//     constructor() {
//         this.x = width / 2;
//         this.y = height / 2;
//         this.t = random(TAU);
//         this.color = [255, 255, 255];
//         this.direction = 1;
//     }

//     draw() {
//         // Draws Circle in the middle of the screen
//         noFill();
//         beginShape();
//         stroke(this.color);
//         let diameter = map(level, 0, 1, 0, 100);
//         let radius = diameter / 2;
        
//         endShape();
//     }
// }




// ! --------------------------------------------------------------

let input;
let audioFile;

async function selectMp3File() {
    userStartAudio();
    return new Promise((resolve, reject) => {
        input = document.createElement('input');
        input.accept = 'audio/*, .mp3, .ogg, .wav, .m4a, .aac';
        input.type = 'file';

        input.onchange = e => {
            console.log(e)
            resolve(e.target.files[0]);
            audioFile = e.target.files[0];
        };
        input.click();
    });
}


const hideFirstClick = () => {
    showFirstClickInfo = false;
    removeSoundButtons();
    textWriter.hideFirstClick();
}

const handleMouseClick = () => {
    if (sound) {
        soundObj.togglePlay();
    } else {
        selectMp3File().then(file => {
            sound = loadSound(file, soundObj.preloadCallback);
            hideFirstClick();
            
        });
    }
}

let defaultSounds = [
    {
        name: "afterDark.mp3",
        url: "./assets/afterDark.mp3"
    },
    {
        name: "neverLeave.mp3",
        url: "./assets/neverLeave.mp3"
    },
]

function preload() {
    soundFormats('mp3', 'ogg', 'wav', 'm4a', 'aac');
    // let soundFile = openFileBrowser();
    // sound = loadSound('afterDark.mp3', this.preloadCallback);
    bpm = 140;
    dropTime = 30.5;
}

// Add buttons for playing default sounds
let soundButtons = [];
const addSoundButtons = () => {
    // place in middle of screen
    let soundButtonX = width / 2 - 110;
    let soundButtonY = height / 2 - 90;
    let soundButtonSpacing = 20;

    // Add Mic Input Button
    let micButton = createButton("Mic Input");
    micButton.position(soundButtonX, soundButtonY);
    micButton.mousePressed(() => {
        soundObj.enableMicInput();
        hideFirstClick();
        usingMic = true;
    });
    micButton.style('border', 'none');
    micButton.style('border-radius', '5px');
    soundButtons.push(micButton);
    soundButtonY += soundButtonSpacing;

    // Add Default Sound Buttons
    for (let i = 0; i < defaultSounds.length; i++) {
        let button = createButton("Load Default Sound " + defaultSounds[i].name);
    
        button.position(soundButtonX, soundButtonY);
        button.mousePressed(() => {
            userStartAudio();
            sound = loadSound(defaultSounds[i].url, soundObj.preloadCallback);
            hideFirstClick();
        });
        button.style('border', 'none');
        button.style('border-radius', '5px');
        soundButtons.push(button);
        soundButtonY += soundButtonSpacing;
    }
};

const removeSoundButtons = () => {
    for (let i = 0; i < soundButtons.length; i++) {
        soundButtons[i].remove();
    }
    soundButtons = [];
}

function setup() {
    getAudioContext().suspend();
    const buttons = {
        currentButtons: [],
        currentText: [],
        currentButtonX: 10,
        currentButtonY: 10,
        currentButtonSpacing: 20,
        addToggleButton(buttonName, buttonFunction) {
            let button = createButton(buttonName);
            button.position(this.currentButtonX, this.currentButtonY);
            button.mousePressed(buttonFunction);
            button.style('border', 'none');
            button.style('border-radius', '5px');
            this.currentButtons.push(button);
            this.currentButtonY += this.currentButtonSpacing;
        },
        addSlider(min, max, defaultValue, step, label) {
            // add label
            let y = this.currentButtonX;
            if (label) {
                let labelElement = createP(label);
                labelElement.style('color', '#FFFFFF');
                labelElement.position(this.currentButtonX, this.currentButtonY - 15);
                this.currentText.push(labelElement);
                y += 70;
            }
            let slider = createSlider(min, max, defaultValue, step);
            slider.position(y, this.currentButtonY);
            slider.style('width', '200px');
            this.currentButtons.push(slider);
            this.currentButtonY += this.currentButtonSpacing;
            return slider;
        },
        hideAllButtons() {
            for (let i = 0; i < this.currentButtons.length; i++) {
                this.currentButtons[i].remove();
            }
            for (let i = 0; i < this.currentText.length; i++) {
                this.currentText[i].remove();
            }
        },
    };

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.mouseClicked(handleMouseClick);

    levelMultiplierSlider = buttons.addSlider(0, 255, 100, 1, "levelMulti");
    ringStretchSlider = buttons.addSlider(1, 5, 3, 1, "ringStretch");

    addSoundButtons();

    buttons.addToggleButton("Sound Info", () => {
        showSoundInfo = !showSoundInfo;
    });

    buttons.addToggleButton("Flares", () => {
        flaresOn = !flaresOn;
    });

    buttons.addToggleButton("Inverse", () => {
        botchedMode = !botchedMode;
    });

    buttons.addToggleButton("💯 Toggle", () => {
        reallybotchedMode = !reallybotchedMode;
    });

    buttons.addToggleButton("👁️ Mode", () => {
        eyeMode = !eyeMode;
    });

    buttons.addToggleButton("Center", () => {
        centerToggle = !centerToggle;
    });

    // buttons.addToggleButton("Inner*2", () => {
    //     halfInnerViz = !halfInnerViz;
    // });

    // buttons.addToggleButton("Outer*2", () => {
    //     halfOuterViz = !halfOuterViz;
    // });

    buttons.addToggleButton("StarFlies", () => {
        shootingStarToggle = !shootingStarToggle;
    });

    buttons.addToggleButton("Stars", () => {
        regularStarToggle = !regularStarToggle;
    });

    buttons.addToggleButton("FPS", () => {
        fpsToggle = !fpsToggle;
    });

    buttons.addToggleButton("Background", () => {
        enableBackground = !enableBackground;
    });

    buttons.addToggleButton("Jumpy Starflies", () => {
        jumpystars = !jumpystars;
    });

    buttons.addToggleButton("Remove Inputs", () => {
        buttons.hideAllButtons();
    });

    amplitude = new p5.Amplitude();
    fft = new p5.FFT();

    starCount = windowWidth * starCountMultiplier;
    shootingStarCount = starCount / 5;

    background(20);

    for (var i = 0; i < starCount; i++) {
        stars[i] = new Star();
        flares[i] = new Flare(
            stars[i].x,
            stars[i].y,
            stars[i].w,
            stars[i].h,
            stars[i].size
        );
    }
    for (var i = 0; i < shootingStarCount; i++) {
        shootingStars[i] = new ShootingStar();
    }
}

function draw() {
    levelMultiplier = levelMultiplierSlider.value();
    ringStretch = ringStretchSlider.value();
    level = amplitude.getLevel() * levelMultiplier;
    spectrum = fft.analyze();
    waveform = fft.waveform();
    if (sound && !usingMic) {
        beat = sound.currentTime() % (60 / bpm);
        currTime = sound.currentTime();
    }

    if (fpsToggle) {
        textWriter.writeFps();
    }

    if (enableBackground) {
        background(0, 0, 0, 20);
    }

    // * Text
    textWriter.writeInfo();
    textWriter.writeSoundInfo();

    // * Sound Features
    // soundObj.addSoundFeatures();
    if (centerToggle) {
        soundObj.drawCircleWaveform();
    }
    if (eyeMode) {
        soundObj.drawCornerWaveforms();
    }

    // soundObj.drawSpectrum();

    // // * Center Perlin Circle
    // centerPerlin.draw();

    // * Shooting Stars
    if (shootingStarToggle) {
        for (var i = 0; i < shootingStars.length; i++) {
            shootingStars[i].draw();
        }
    }

    // * Stars
    if (regularStarToggle) {
        for (var i = 0; i < stars.length; i++) {
            let starD = stars[i].draw();
            if (flaresOn) {
                let flareD = flares[i].draw(starD);
            }
        }
    }
}