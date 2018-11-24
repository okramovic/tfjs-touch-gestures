
const g1 = {}


function preload(){
	// load one gest data and display them as lines
	const url = 'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg1.json?1543081301218';
	loadJSON(url, res =>{
		l('data', res.desc)
		g1.desc = res.desc
		g1.data = res.data
	})
	
	/*fetch(url)
	.then( res=>res.json())
	.then(res=>{
		l('res', res)
		g1.desc = res.desc
		g1.data = res.data
	})*/
}

function setup(){
	createCanvas(360,560)
	background(200)
	l('sueno')
	
	drawOneGesture(g1, 0)
}

function draw(){
		//
}

function drawOneGesture(gest, ind){
	l(gest, ind)
	
	const f1 = [],
		  f2 = []
	// get points for one finger, then for another
	gest.data[ind].map((num,i)=>{
		if (num != 0) f1.push(num)
	})
	l(f1.length, f1)
}
