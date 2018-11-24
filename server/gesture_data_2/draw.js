
const allData = {}

const phoneW = 360,
	  phoneH = 560;

function preload(){
	// load one gest data and display them as lines
	const urls = {
		g1: 'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg1.json?1543086174844',
		g4: 'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg4.json?1543086175165',
		g7: 'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fg7.json?1543086175046'
	}
		
	
	Object.keys(urls).map( key=>{
		l(key, urls[key])
		loadJSON(urls[key], res =>{
			l(key, 'data', res.desc)
			allData[key] = {}
			allData[key].desc = res.desc
			allData[key].data = res.data
		})
	})
	
	/*fetch(url).then( res=>res.json()).then(res=>{l('res', res);g1.desc = res.desc;g1.data = res.data})*/
}

function setup(){
	createCanvas(360,560)
	background(color(235,235,255))
	l('sueno')
	
	Object.keys(allData).map((gest,j) =>{
		//if (gest != 'g7') return;
		
		const group = allData[gest]
		for (let i=0; i< group.data.length; i++){
			const arr = [0,0,0]
			arr[j] = 255-2*(i+1)
			const col = color(arr)
			drawOneGesture(group, i, col)
		}
	})
}

function draw(){
		//
}

function drawOneGesture(raw, index, strokeVal){
	//l(raw.desc, index)
	const gest1 = raw.data[index].filter(num=>num)
	const gest2 = raw.data[index].filter(num=>!num)
	if (gest1.length != 40) return l('gesture length is not 40');
	
	const f1 = [],
		  f2 = [] // todo
	// get points for one finger, then for another
	//gest.data[index].filter(num=>num)
	gest1.map((num,i)=>{
		//l(i, num, i % 2)
		if (i % 2 == 0){ f1.push({x:num, y: gest1[i+1]}) }
	})
	//l(f1.length, f1)
	
	
	// draw
	stroke(strokeVal)
	strokeWeight(2)
	noFill();
	beginShape()
	for (let p of f1){
		//l('p', p)
		//l(p.x * phoneW, p.x)
		vertex(p.x * phoneW, p.y* phoneH)
	}
	endShape()
	
}
