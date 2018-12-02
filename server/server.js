'use strict'

const gestures = ['g1','g4','g7','g8','g10','g11'];

global.fetch = require('node-fetch');

const express = require('express'),
app = express(),
http = require('http').Server(app),
fs = require('fs'),
osc = require('osc-min'),
dgram = require('dgram'),
OSC = require('osc-js'),
tf = require('@tensorflow/tfjs'),
SerialPort = require('serialport')	// https://serialport.io/docs/en/api-serialport
let serial;

let io = require('socket.io')(http);

let model;

const serPort = '/dev/ttyACM0';
try {
	serial = new SerialPort( serPort, {baudRate: 9600})
	console.log('serial',!!serial)
} catch (ex){
	console.error('couldnt connect to Serial port',serPort)
}


let r = 0,
	g = 0,
	b = 0,
	pr,pg,pb; // remember previous vals
let prevHue, nowHue;

let timer, dateS, dateE;

const gest_folder = 'gesture_data_3';
const _collect = process.argv[2] && process.argv[2] == '--collect'? true : false;
// g1, g2, ... g6, etc
const _gesto = _collect && process.argv[3] ? process.argv[3].replace('--','') : null;
let _desc = '';
switch(_gesto){
	case 'g1': _desc = 'intensity 20% down'; break;
	case 'g4': _desc = 'intensity 20% up'; break;
	case 'g7': _desc = 'intensity to 0%'; break;
	case 'g8': _desc = 'intensity to 100%'; break;
	case 'g10': _desc = 'o clock mode'; break;
	case 'g11': _desc = 'goodnight mode'; break;
	default: console.log('no gesture provided !!')
}
if (_collect && _gesto) console.log(`* * * collecting data for ${_gesto}, ${_desc} into /${gest_folder}/ * * *`)

app.use((req,res,next)=>{
	console.log('req for',req.url)
	next()
})
app.use('/data',express.static('gesture_data_3'))
app.use(express.static('public'))
app.get('/',(req,res)=>{ res.sendFile(__dirname + '/index.html')})
app.get('/draw',(req,res)=>{ 
	console.log(__dirname)
	res.sendFile(__dirname + '/gesture_data_3/index.html')
})



var remoteIp = '127.0.0.1'
var remotePort = 6448

var udpServer = dgram.createSocket('udp4');

(async ()=>{
	// model in folder: gesture data 3
	model = await tf.loadModel('http://localhost:3000/model_b1.json')
	console.log('awaited model', !!model)
	
	//const idk1 = [0.58333,0.38036,0,0,0.57778,0.40714,0,0,0.575,0.43036,0,0,0.56944,0.47143,0,0,0.56389,0.49286,0,0,0.55833,0.51964,0,0,0.55833,0.53571,0,0,0.55556,0.56071,0,0,0.55278,0.56786,0,0,0.55278,0.57679,0,0,0.55,0.57857,0,0,0.55,0.58214,0,0,0.55,0.58393,0,0,0.55,0.58929,0,0,0.55,0.58929,0,0,0.55,0.59107,0,0,0.55,0.59107,0,0,0.55,0.59286,0,0,0.55,0.59286,0,0,0.55,0.59286,0,0];
	//const res = await model.predict(tf.tensor2d(idk1,[1,80]))
	//console.log('expect:', 1, res.dataSync())
})()


io.on('connection', (socket) => {
  console.log('user connected')

  const options = { send: { port: 11245 } }
  const osc_js = new OSC({ plugin: new OSC.DatagramPlugin(options) })

  osc_js.on('/wek/outputs', (message) => {
            console.log('msg', message.args)
            io.emit('controls', message.args);
  })

  osc_js.on('open', () => {
       console.log('osc open')
       //osc.send(new OSC.Message('/response', Math.random()))
  })

  osc_js.open({port: 12000})
  socket.on('oneCol', gestData => {
	console.log('one col', JSON.stringify(gestData))
	
	if (timer) clearInterval(timer);
	
	//serial.write(JSON.stringify(gestData));
	pr = r;  // remember this values
	pg = g;
	pb = b;
	
	r = gestData[0]
	g = gestData[1]
	b = gestData[2]
	
	serial.write('r' + r)
	serial.write('g' + g)
	serial.write('b' + b)
  })
	  
  socket.on('browser', (gestData) => {
    console.log('browser event', gestData.length, '= 4*20')
    console.log(gestData)
    if (gestData.length != 80) return console.log(' --- not a gesture --- ')
    
    
    classifyGesture(gestData).then( gest=>{
		let cols = [r,g,b];
		
		if (!(gest == 'g10' || gest == 'g11')) clearInterval(timer)
		
		// g1, g4, g7, g8, g10, g11
		if (gest == 'g1'){				// 20% less
			pr = r, pg = g, pb = b
			
			r = Math.max(parseInt(r*0.8),0)	
			g = Math.max(parseInt(g*0.8),0)
			b = Math.max(parseInt(b*0.8),0)
			
		} else if (gest == 'g4'){		// 20% more
			pr = r, pg = g, pb = b
			
			r = Math.min(parseInt(r*1.2),255)	
			g = Math.min(parseInt(g*1.2),255)
			b = Math.min(parseInt(b*1.2),255)
			
		} else if (gest == 'g7'){
			pr = r, pg = g, pb = b
			
			r = 0	// 0% 
			g = 0
			b = 0
		} else if (gest == 'g8'){
			r = pr	// previous
			g = pg
			b = pb
			
		} else if (gest == 'g10'){
			
			if (timer) clearInterval(timer)
			prevHue = rgbToHsl(r, g, b)	// https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
			console.log('prevHue',prevHue)
			timer = setInterval(()=>{
				prevHue[0] += 10
				if (prevHue[0]>=360) prevHue[0] -= 360
				console.log('new h', prevHue[0], prevHue[0]/360)
				
				const newHue = [prevHue[0]/360, prevHue[1], prevHue[2]]
				
				const rgbs = hslToRgb(...newHue)
				
				//console.log('   rgbs', rgbs)
				sendToArdu('r', rgbs[0])
				sendToArdu('g', rgbs[1])
				sendToArdu('b', rgbs[2])
			},2000) // arduino cant make it with faster interval
			
			return;
		} else if (gest == 'g11'){
			clearInterval(timer);
			
			timer = setInterval(()=>{
				r *= 0.75;
				g *= 0.75;
				b *= 0.75;
				sendToArdu('r', r)
				sendToArdu('g', g)
				sendToArdu('b', b)
				
				// turn off computer & light
				if (r<30 && g<30 && b<30){
					clearInterval(timer);
					console.log('will shut down')
					setTimeout(()=>{
						sendToArdu('r', 0)
						sendToArdu('g', 0)
						sendToArdu('b', 0)
						//process.exit(0)
					}, 3000)
					
				}
			},5000)
		}
		
		console.log('news',r,g,b)
		sendToArdu('r', r)
		sendToArdu('g', g)
		sendToArdu('b', b)	
	})
    
    
    if (!_gesto) return console.log('not recording')
    

    // save gesture data to its file (for tensorflow)
    const fileName = process.cwd() + '/' + gest_folder + '/' + _gesto +'.json';
    fs.readFile(fileName,'utf8',(err, data)=>{
    	if (err) throw err;
    	data = JSON.parse(data)
    	
    	data.data.push(gestData)  //[0.0,1.0])
    	
    	fs.writeFileSync( fileName, JSON.stringify(data), 'utf8') 
    	console.log(_gesto, data.data.length)
    })

	return;
	
	// for wekinator
	const args = []
    gestData.forEach(element =>{
      args.push({
        type: 'float',
        value: parseFloat(element) || 0
      })
    })
    const oscMsg = osc.toBuffer({
      oscType: 'message',
      address: '/wek/inputs',
      args: args
    })
    udpServer.send(oscMsg, 0, oscMsg.length, remotePort, remoteIp)
  })
})

function rgbToHsl(r, g, b){
      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if(max == min){
          h = s = 0; // achromatic
      } else {
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
              case r: h = (g - b) / d ; break;
              case g: h = 2 + ( (b - r) / d); break;
              case b: h = 4 + ( (r - g) / d); break;
          }
          h*=60;
          if (h < 0) h +=360;
      }
     return([h, s, l]);
} 

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function sendToArdu(col, val){
	serial.write(col + val);
}

async function classifyGesture(gestData){
	let res = await model.predict(tf.tensor2d(gestData,[1,80]))
	res = res.dataSync()
	const max = Math.max(...res)
	console.log('res', max, '\n',res)
	
	const final = gestures[res.indexOf(max)]
	console.log('class', final)
	return final;
}

/*udpServer.on('listening', () =>{
    console.log('udp listens')
})
udpServer.on('message', (msg, remote)=>{
    // /wek/outputs
    console.log('outputs', JSON.stringify(msg))
    //console.log(remote.address + ':' + remote.port +' - ' + message);

});*/

//udpServer.bind(12000, remoteIp);


http.listen(3050, ()=>{ console.log('http on 3050')})

//io.listen(3000)
//console.log('socket listening on port 3000')
