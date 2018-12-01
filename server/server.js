'use strict'

global.fetch = require('node-fetch');

const express = require('express'),
app = express(),
http = require('http').Server(app),
fs = require('fs'),
osc = require('osc-min'),
dgram = require('dgram'),
OSC = require('osc-js'),
tf = require('@tensorflow/tfjs'),
SerialPort = require('serialport')//.SerialPort;	// https://serialport.io/docs/en/api-serialport

let io = require('socket.io')(http);

/*
const serPort = '/dev/ttyACM0';
try {
	const serial = new SerialPort( serPort, {baudRate: 9600})
	console.log(serial)
} catch (ex){
	console.error('couldnt connect to Serial port',serPort)
}*/



//serial.write("robot on");

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



app.use(express.static('public'))
app.get('/',(req,res)=>{ res.sendFile(__dirname + '/index.html')})


var remoteIp = '127.0.0.1'
var remotePort = 6448

var udpServer = dgram.createSocket('udp4');

/*(async ()=>{
	console.log('iife')
	const model = await tf.loadModel('http://localhost:3000/model_a.json')
	console.log('awaited', model)
	
	const idk1 = [0.58333,0.38036,0,0,0.57778,0.40714,0,0,0.575,0.43036,0,0,0.56944,0.47143,0,0,0.56389,0.49286,0,0,0.55833,0.51964,0,0,0.55833,0.53571,0,0,0.55556,0.56071,0,0,0.55278,0.56786,0,0,0.55278,0.57679,0,0,0.55,0.57857,0,0,0.55,0.58214,0,0,0.55,0.58393,0,0,0.55,0.58929,0,0,0.55,0.58929,0,0,0.55,0.59107,0,0,0.55,0.59107,0,0,0.55,0.59286,0,0,0.55,0.59286,0,0,0.55,0.59286,0,0];
	const res = await model.predict(tf.tensor2d(idk1,[1,80]))
	console.log('expect:', 1, res.dataSync())
})()*/


io.on('connection', (socket) => {
  console.log('user connected')

  const options = { send: { port: 11245 } }
  const osc_js = new OSC({ plugin: new OSC.DatagramPlugin(options) })

  //console.log('osc_js',osc_js)

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
	return console.log('one col', JSON.stringify(gestData))
	//serial.write(JSON.stringify(gestData));
	serial.write('r' + gestData[0])
	serial.write('g' + gestData[1])
	serial.write('b' + gestData[2])
  })
	  
  socket.on('browser', (gestData) => {
    console.log('browser event', gestData.length, '= 4*20')
    console.log(gestData)
    if (gestData.length != 80) {
    	console.log(' --- not a gesture --- ')
    	return;
    }
    
    
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
