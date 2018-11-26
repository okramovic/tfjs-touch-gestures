let cnv

function setup(){
	document.querySelector('span').innerHTML = 'setup';
	cnv  = createCanvas(innerWidth,innerHeight - 24)
	
	const body = select('body')
	body.touchEnded(handleMouseEnd)
	
	//background(color(200,200,220))
	noLoop();
}

function draw(){
}

