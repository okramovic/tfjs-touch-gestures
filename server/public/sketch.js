let cnv
let hue1;

function preload(){
	
	hue1 = loadImage('/wheel1-nobck.png')
	show('hue1',!!hue1)
}

function setup(){
	document.querySelector('span').innerHTML = 'setup';
	cnv  = createCanvas(innerWidth,innerHeight - 24)
	
	const body = select('body')
	body.touchEnded(handleMouseEnd)
	
	toggleHue(1)
	//image(hue1, 0,0, width, width)
	//background(color(200,200,220))
	noLoop();
}

function draw(){
}

function toggleHue(on){
	if (on) image(hue1, 0,0, width, width)
	else clear()
}
