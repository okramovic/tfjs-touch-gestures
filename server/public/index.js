const socket = io('192.168.0.136:3050'); // from https://whatismyip.live/  //io('http://localhost:3050')
const inputsNumber = 40; // how long/complex gestures will this allow?


document.querySelector('span').innerHTML = 'wilkommen';


socket.on('connect', function() {
  
  document.querySelector('span').innerHTML = 'connected';
  
  let isMouseDown = false;
  let rawData = []
  //let originX1, originY1, originX2, originY2; // XYs for both fingers

  document.ontouchstart = e => {
    isMouseDown = true;
    // finger 1
    //originX1 = parseInt(e.touches[0].clientX);
    //originY1 = parseInt(e.touches[0].clientY);
    // finger 2
    //originX2 = e.touches[1] ? parseInt(e.touches[1].clientX) : 0;
    //originY2 = e.touches[1] ? parseInt(e.touches[1].clientY) : 0;
    //show(originX2, originY2);
    //show(e.touches[1]? JSON.stringify(e.touches[1].clientX) : 'none')
    e.preventDefault();
  }
  document.ontouchend = handleMouseEnd
  
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


  

  function handleMouseEnd(e){
    isMouseDown = false
    let inputsArray = []

    // TODO: how do I deal with short gestures?
    // Ignore for now, later maybe interpolation
    if ((rawData.length * 2) < inputsNumber) {
      rawData = []
      return
    }

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
      
      let x2 = (rawData[Math.round(sampleIndex)].x2) / window.innerWidth
      let y2 = (rawData[Math.round(sampleIndex)].y2) / window.innerHeight
      x2 = parseFloat( x2.toFixed(5) )
      y2 = parseFloat( y2.toFixed(5) )
      inputsArray.push(x1, y1, x2, y2);
      sampleIndex += downsampleFactor;
      show(x1,y1);
    }

    socket.emit('browser', inputsArray)
    rawData = []
    
    //originX1 = originY1 = originX2 = originY2 = 0
  }
})


function show(){
	document.querySelector('span').innerHTML = [...arguments].join();
}
