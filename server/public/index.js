const socket = io('192.168.0.136:3050'); // from https://whatismyip.live/  //io('http://localhost:3050')
const inputsNumber = 40; // how long/complex gestures will this allow?

let isMouseDown = false;
let rawData = []
//let originX1, originY1, originX2, originY2; // XYs for both fingers

document.querySelector('span').innerHTML = 'wilkommen';



socket.on('connect', function() {
  
  document.querySelector('span').innerHTML = 'connected';
  
  document.ontouchstart = e => {
    isMouseDown = true;
    show('touch Start')
    e.preventDefault();
  }
  //document.ontouchend = handleMouseEnd
  
  document.ontouchmove = e => {
     
     if(isMouseDown) {
       
       const x1 = parseInt(e.touches[0].clientX),
		     y1 = parseInt(e.touches[0].clientY),
		     x2 = e.touches[1] ? parseInt(e.touches[1].clientX) : 0,
		     y2 = e.touches[1] ? parseInt(e.touches[1].clientY) : 0;
       rawData.push({ x1, y1, x2, y2})
       //show(x1,y1,x2,y2)
     }
     e.preventDefault();
  }
})


function handleMouseEnd(e){
    isMouseDown = false
    let inputsArray = []

    // TODO: how do I deal with short gestures?
    // Ignore for now, later maybe interpolation
    if ((rawData.length * 2) < inputsNumber) {
      rawData = []
      return
    }

	// for drawing
	const fin1 = [],
		  fin2 = [];

    // Downsample by sampling every N sample using the downsampleFactor variable
    // Move to the origin (first coordinate user clicked on)
    // Normalize to -1 1 range
    
    const downsampleFactor = (rawData.length*2) / inputsNumber;
    let sampleIndex = 0;

    for (let i=0; i<inputsNumber/2; i++) { // i reaches 19
      
      let x1 = (rawData[Math.round(sampleIndex)].x1) / window.innerWidth
      let y1 = (rawData[Math.round(sampleIndex)].y1) / window.innerHeight
      x1 = parseFloat( x1.toFixed(5) )
	  y1 = parseFloat( y1.toFixed(5) )
		fin1.push({x:x1, y: y1})
      
      let x2 = (rawData[Math.round(sampleIndex)].x2) / window.innerWidth
      let y2 = (rawData[Math.round(sampleIndex)].y2) / window.innerHeight
      x2 = parseFloat( x2.toFixed(5) )
      y2 = parseFloat( y2.toFixed(5) )
		fin2.push({x:x2,y:y2})
      
      inputsArray.push(x1, y1, x2, y2);
      sampleIndex += downsampleFactor;
    }

    socket.emit('browser', inputsArray)
    rawData = []
    //originX1 = originY1 = originX2 = originY2 = 0
    
    // draw last gesture on canvas
    clear()
    const fingers = [fin1, fin2];
    fingers.map((points,j) =>{
		for (let i=1; i<points.length; i++){
			if (!(points[i].x && points[i].y)) continue;	// = dont draw finger 2
			
			const p1 = points[i-1], p2 = points[i];
			
			strokeWeight(i+4)
			stroke(0,70,255/20*i)
			
			line(p1.x*width, p1.y*height, 
				 p2.x*width, p2.y*height)	// line is better, vertexes cant change stroke and weight
		}
	})
}


function show(){
	document.querySelector('span').innerHTML = [...arguments].join();
}
