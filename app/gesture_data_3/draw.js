
const g1 = {}

const gli = {
	g1: 'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg1.json?1543691240544',
	g4:'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg4.json?1543691240807',
	g7:'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg7.json?1543691240950',
	g8:'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg8.json?1543691241078',
	g10:'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg10.json?1543691241333',
	g11:'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg11.json?1543691241537',
	g19:'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg19.json?1543868180243',
	
}


function preload(){
	// load one gest data and display them as lines
	loadJSON(gli.g19, res =>{	// url
		l(res.desc)
		g1.desc = res.desc
		g1.data = res.data
	})
}

function setup(){
	createCanvas(360,560)
	background(200)
	l('gest data', g1)
	
	
	for (let i=0; i<g1.data.length; i++) 
		drawOneGesture(g1, i)
}

function draw(){}


function drawOneGesture(gest, ind){
	
	let data1 = gest.data[ind].filter(num=>num),
		f2 = [];
	// get points for one finger
	
	
	let f1 = data1.map((num,i)=>{
		if (i % 2 == 0) return {x: num, y: data1[i+1]}
		
	})
	.filter(x=>x)
	//l('f1.length', f1.length)
	
	
	for (let i=1; i< f1.length; i++){
		const p2 = f1[i-1]
		const p1 = f1[i]
		
		strokeWeight(2)
		stroke(0,0,100+(i*8))
		
		line(p2.x* width, p2.y*height, p1.x*width, p1.y*height)
	}
}
