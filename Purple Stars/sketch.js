
var stars = [];
var flares = [];
let starCount;

const starCountMultiplier = 1.5;
const flareAlpha = 2;

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.mousePressed(userStartAudio);
    starCount = windowWidth * starCountMultiplier;

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
}

function draw() {
    background(20);

    for (var i = 0; i < stars.length; i++) {
        let starD = stars[i].draw();
        let flareD = flares[i].draw(starD);
        // fill(255,255,255)
        // circle(mouseX, mouseY, 20);
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
    }

    draw() {
        this.t += 0.1;
        var scale = this.size + sin(this.t) * 2;
        noStroke();
        fill(this.first, this.second, this.third);
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
