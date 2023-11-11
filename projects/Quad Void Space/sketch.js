function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);
}

function draw() {
	let halfWidth = windowWidth/2;
	let halfHeight = windowHeight/2;
	
	line(random(halfWidth), random(halfHeight), random(halfWidth), random(halfHeight));
	line(random(halfWidth, windowWidth), random(halfHeight, windowHeight), random(halfWidth, windowWidth), random(halfHeight, windowHeight));
	line(random(halfWidth), random(halfHeight, windowHeight), random(halfWidth), random(halfHeight, windowHeight));
	line(random(halfWidth, windowWidth), random(halfHeight), random(halfWidth, windowWidth), random(halfHeight));
	
	
	let sSize = random(20);
	fill(random(255), random(255), random(255));
	square(random(windowWidth), random(windowHeight), sSize);
	circle(random(windowWidth), random(windowHeight), sSize);
	square(random(windowWidth), random(windowHeight), sSize);
	circle(random(windowWidth), random(windowHeight), sSize);
	let cir = circle(mouseX, mouseY, 20);
}