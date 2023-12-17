var blobPoints = [];
var blobPointsCopy = [];
let numPoints = 20; // try different values for different shaped blobs
let baseRadius = 400;
let radiusRandomness = 0.2; // amount of random variation in the blob radius 
let cpOffsetAngle;

let angleSlider = 2; // wobble = 2.4  | safe range : 1 - 2.6
let distanceSlider = 50; // stretch = 50

var allBlobs = [];
var startedBlob;

var futureBlob;
var allFutureBlobs = [];

var interiorAmount = 0.99;
var nOffsetAmount = 0.005;
var interiorCount = 200;
var changeSpeed = 0.05;

var blobColors = [];


function setup() {
    createCanvas(windowWidth, windowHeight);

    startedBlob = getBlob();
    futureBlob = getBlob();

    allBlobs = buildBlobs(interiorCount);
    allFutureBlobs = buildBlobs(interiorCount, futureBlob);

    console.log(allBlobs);

    for (let i = 0; i < interiorCount; i++) {
        blobColors.push(randomColor());
    }

}

const buildBlobs = (amount, firstBlob=startedBlob) => {
    var startBlob = firstBlob;
    var allNBlobs = [];
    // when startedBlob is changed, it also changes the blobPointsCopy
    let offsetAmount = interiorAmount;
    for (let i = 0; i < amount; i++) {
        let blob = [];
        for (let b = 0; b < startBlob.length; b++) {
            let bp = startBlob[b];
            blob.push({
                x: bp.x * offsetAmount,
                y: bp.y * offsetAmount,
                cp: [
                    {
                        x: bp.cp[0].x * offsetAmount,
                        y: bp.cp[0].y * offsetAmount,
                    },
                    {
                        x: bp.cp[1].x * offsetAmount,
                        y: bp.cp[1].y * offsetAmount,
                    }
                ]
            })
        }
        offsetAmount -= nOffsetAmount;
        allNBlobs.push(blob);
    }
    return allNBlobs;
}

var slowlyMoveAllBlobsToAllFutureBlobs = () => {
    // slowly move all blobs to all future blobs
    var movementSpeed = changeSpeed;
    for (let i = 0; i < allBlobs.length; i++) {
        let currentBlob = allBlobs[i];
        for (let b = 0; b < currentBlob.length; b++) {
            let bp = allBlobs[i][b];
            bp.x += (allFutureBlobs[i][b].x - bp.x) * movementSpeed;
            bp.y += (allFutureBlobs[i][b].y - bp.y) * movementSpeed;
            bp.cp[0].x += (allFutureBlobs[i][b].cp[0].x - bp.cp[0].x) * movementSpeed;
            bp.cp[0].y += (allFutureBlobs[i][b].cp[0].y - bp.cp[0].y) * movementSpeed;
            bp.cp[1].x += (allFutureBlobs[i][b].cp[1].x - bp.cp[1].x) * movementSpeed;
            bp.cp[1].y += (allFutureBlobs[i][b].cp[1].y - bp.cp[1].y) * movementSpeed;
        }
    }
}



const offsetInside = (pointsParam, amount=interiorAmount) => {
    // takes the points and returns a new set of points that are slightly offset inside
    let points = [...pointsParam];
    let newPoints = [];
    points.forEach(p => {
        newPoints.push({
            x: p.x * amount,
            y: p.y * amount,
            cp: [
                {
                    x: p.cp[0].x * amount,
                    y: p.cp[0].y * amount,
                },
                {
                    x: p.cp[1].x * amount,
                    y: p.cp[1].y * amount,
                }
            ]
        })
    })
    return newPoints;
}

const howCloseStarterIsToFuture = () => {
    // returns a number between 0 and 1
    // 0 means they are the same
    // 1 means they are completely different
    // 0.5 means they are half different
    // 0.25 means they are a quarter different
    // etc
    // so the closer to 0 the better
    var total = 0;
    for (let i = 0; i < allBlobs.length; i++) {
        let currentBlob = allBlobs[i];
        for (let b = 0; b < currentBlob.length; b++) {
            let bp = allBlobs[i][b];
            total += Math.abs(bp.x - allFutureBlobs[i][b].x);
            total += Math.abs(bp.y - allFutureBlobs[i][b].y);
            total += Math.abs(bp.cp[0].x - allFutureBlobs[i][b].cp[0].x);
            total += Math.abs(bp.cp[0].y - allFutureBlobs[i][b].cp[0].y);
            total += Math.abs(bp.cp[1].x - allFutureBlobs[i][b].cp[1].x);
            total += Math.abs(bp.cp[1].y - allFutureBlobs[i][b].cp[1].y);
        }
    }
    return total / (allBlobs.length * allBlobs[0].length * 6);
}

const prevColor = [0, 0, 0];
var randomColor = () => {
    let colorX = noise(prevColor[0], windowWidth) * 255;
    colorX = map(colorX, 0, 255, 0, 255);
    let colorY = noise(prevColor[1], windowHeight) * 255;
    colorY = map(colorY, 0, 255, 0, 255);
    let colorZ = noise(prevColor[2], windowWidth + windowHeight) * 255;
    colorZ = map(colorZ, 0, 255, 0, 255);
    prevColor[0] += 0.1;
    prevColor[1] += 0.1;
    prevColor[2] += 0.1;
    return color(colorX, colorY, colorZ);
    // return color(random(255), random(255), random(255));
}

const drawFutureBlob = false;
var timer = 0;
function draw() {
    background(0);
    noStroke();
    translate(windowWidth/2, windowHeight/2)
    stroke(0);
    strokeWeight(1);

    if (startedBlob == futureBlob) {
        console.log("same");
        futureBlob = getBlob();
    } else {
        slowlyMoveAllBlobsToAllFutureBlobs();
    }

    console.log(howCloseStarterIsToFuture());
    if (howCloseStarterIsToFuture() < 4) {
        futureBlob = getBlob();
        allFutureBlobs = buildBlobs(interiorCount, futureBlob);
    }

    if (drawFutureBlob) {
        beginShape(); // start drawing the shape
        vertex(futureBlob[0].x, futureBlob[0].y); // first point is a plain vertex
    
        for (b = 1; b < futureBlob.length; b++) {
            // start from 1 (the second node in the ring)
            let bp = futureBlob[b];
            let pp = futureBlob[b - 1]; // previous node
            // bezier points go:
            // second control point from previous node
            // first control point from this node
            // x and y of this node
            bezierVertex(pp.cp[1].x, pp.cp[1].y, bp.cp[0].x, bp.cp[0].y, bp.x, bp.y);
        }
        // to finish, wrap around
        // so join the last point in the ring to the first point in the same way as above
        let lastp = futureBlob[futureBlob.length - 1];
        let firstp = futureBlob[0]
        bezierVertex(lastp.cp[1].x, lastp.cp[1].y, firstp.cp[0].x, firstp.cp[0].y, firstp.x, firstp.y);
        endShape();
    }

    for (let i = 0; i < allBlobs.length; i++) {
        let blob = allBlobs[i];
        beginShape(); // start drawing the shape
        vertex(blob[0].x, blob[0].y); // first point is a plain vertex

        for (b = 1; b < blob.length; b++) {
            fill(blobColors[i]);
            // start from 1 (the second node in the ring)
            let bp = blob[b];
            let pp = blob[b - 1]; // previous node
            // bezier points go:
            // second control point from previous node
            // first control point from this node
            // x and y of this node
            bezierVertex(pp.cp[1].x, pp.cp[1].y, bp.cp[0].x, bp.cp[0].y, bp.x, bp.y);
        }
        // to finish, wrap around
        // so join the last point in the ring to the first point in the same way as above
        let lastp = blob[blob.length - 1];
        let firstp = blob[0]
        bezierVertex(lastp.cp[1].x, lastp.cp[1].y, firstp.cp[0].x, firstp.cp[0].y, firstp.x, firstp.y);
        endShape();
    }

    blobColors.push(randomColor());
    blobColors.shift();


}


const redrawBlobs = () => {
    startedBlob = getBlob();
    allBlobs = buildBlobs(interiorCount);

}

function getBlob() { // this creates a new blob with current settings
    var nblobPoints = []; // empty the array

    // get values from the sliders
    cpOffsetAngle = angleSlider;
    cpdist = distanceSlider;

    // generate points around a ring
    for (let p = 0; p < numPoints; p++) {
        let a = p * TWO_PI / numPoints; // angle of this point
        let r = baseRadius + random(-radiusRandomness * baseRadius, radiusRandomness * baseRadius); // radius randomiser
        // create an object storing the x and y coordinate, and the angle
        // as well as an empty array for storing the control points
        let bp = {
            x: cos(a) * r,
            y: sin(a) * r,
            angle: a,
            cp: []
        };
        nblobPoints.push(bp);
    }

    // now run through again and add the control points

    for (let b = 0; b < nblobPoints.length; b++) { // run through the ring
        let thisp = nblobPoints[b]; // current node
        let randomangle = random(-cpOffsetAngle, cpOffsetAngle); // random angle for control points

        let cp1angle = thisp.angle - (HALF_PI + randomangle);
        let cp2angle = thisp.angle + (HALF_PI - randomangle);
        // make sure the two angles of the control points add up to 180 degrees
        // to keep them in the same line and create a smooth join

        // create the control points
        // note that we use cos and sin to create coordinates
        // relative to the node point
        cp1 = {
            x: thisp.x + (cos(cp1angle) * cpdist),
            y: thisp.y + (sin(cp1angle) * cpdist)
        };
        cp2 = {
            x: thisp.x + (cos(cp2angle) * cpdist),
            y: thisp.y + (sin(cp2angle) * cpdist)
        };

        thisp.cp = [cp1, cp2]; // store control points in the current node in the blobPoints array

    }
    return nblobPoints;
}
