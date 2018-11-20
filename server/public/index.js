//var io = require('socket.io-client')
const socket = io('192.168.0.136:3050'); // from https://whatismyip.live/  //io('http://localhost:3050')
let inputsNumber = 40



// Mouse x, y coordinates over web sockets on mouse drag/ touch
// Inputs number is what Wekinator (or your ML algorithms) expects
document.querySelector('span').innerHTML = '---';


socket.on('connect', function() {
  //socket.emit('browser', ['hello'])
  document.querySelector('span').innerHTML = 'connected';
  
  var isMouseDown = false
  var rawData = []
  var originX, originY

  document.ontouchstart = e => {
    document.querySelector('span').innerHTML = 'touchstart' + e.touches[0].clientX + ' ' + e.touches[0].clientY
    isMouseDown = true
    originX = e.touches[0].clientX  // e.clientX
    originY = e.touches[0].clientY  // e.clientY
    e.preventDefault();
  }
  document.ontouchend = handleMouseEnd
  
  document.ontouchmove = e => {
     //document.querySelector('span').innerHTML = 'MOVE MOVE'
     if(isMouseDown) {
       rawData.push({'x': e.touches[0].clientX, 'y': e.touches[0].clientY})
     }
     e.preventDefault();
  }


  // on pc
  document.onmousemove = function(e) {
    //document.querySelector('span').innerHTML = 'clientX' + e.clientX;
    if(isMouseDown) {
      rawData.push({'x': e.clientX, 'y': e.clientY})
    }
  }
  document.onmousedown = function(e) {
    isMouseDown = true
    originX = e.clientX
    originY = e.clientY
    document.querySelector('span').innerHTML = 'mousedown'
  }

  document.onmouseup = handleMouseEnd //function(e) { handleMouseEnd(e)}


  function handleMouseEnd(e){
    isMouseDown = false
    var inputsArray = []

    // TODO: how do I deal with short gestures?
    // Ignore for now, later maybe interpolation
    if ((rawData.length * 2) < inputsNumber) {
      rawData = []
      return
    }

    // Downsample by sampling every N sample using the downsampleFactor variable
    // Move to the origin (first coordinate user clicked on)
    // Normalize to -1 1 range
    var downsampleFactor = (rawData.length*2) / inputsNumber
    var sampleIndex = 0

    for (var i=0; i<inputsNumber/2; i++) {
      var x = (rawData[Math.round(sampleIndex)].x - originX) / window.innerWidth
      var y = (rawData[Math.round(sampleIndex)].y - originY) / window.innerHeight
      inputsArray.push(x, y)
      sampleIndex += downsampleFactor
    }

    socket.emit('browser', inputsArray)
    rawData = []
    originX = 0
    originY = 0
  }
})
