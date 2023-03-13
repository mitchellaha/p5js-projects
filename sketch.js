
var stars = [];
let starCount;


function setup() {
    createCanvas(windowWidth, windowHeight);
    starCount = windowWidth * 1.5;

    for (var i = 0; i < starCount; i++) {
        stars[i] = new Star();
    }
}

function draw() {
    background(20);
    circle(mouseX, mouseY, 20);

    for (var i = 0; i < stars.length; i++) {
        stars[i].draw();
    }
}

// star class //
class Star {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.size = random(0.25, 3);
        this.t = random(TAU);
        this.first = random(100, 195);
        this.second = random(0,75);
        this.third = random(100,255)
    }

    draw() {
        this.t += 0.1;
        var scale = this.size + sin(this.t) * 2;
        noStroke();
        fill(this.first, this.second, this.third);
        ellipse(this.x, this.y, scale, scale);
        fill(this.first, this.second, this.third, 4);
        // text(tex, this.x, this.y)
        ellipse(this.x, this.y, scale * 10, this.second);
        // for (i = 0; i < 50; i++) {
        //     ellipse(this.x, this.y, scale * 3);
        // }
    }
}

// incidentally, the randomly generated name for this sketch was "Incandescent pigment"

// function setup() {
//     createCanvas(400, 400);
// }

// function draw() {
//     background(0);

//     fill(255, 255, 100, 4);
//     for (i = 0; i < 50; i++) {
//         ellipse(200, 200, i * 3);
//     }
// }