'use strict'

//var io = require('socket.io')()
const express = require('express'),
app = express(),
http = require('http').Server(app),
fs = require('fs'),
osc = require('osc-min'),
dgram = require('dgram'),
OSC = require('osc-js');
let io = require('socket.io')(http);


const _collect = process.argv[2] && process.argv[2] == '--collect'? true : false;
// g1, g2, ... g6, etc
const _gesto = _collect && process.argv[3] ? process.argv[3].replace('--','') : null;
let _desc = '';
switch(_gesto){
	case 'g1': _desc = 'intensity 20% down'; break;
	case 'g4': _desc = 'intensity 20% up'; break;
	case 'g7': _desc = 'intensity to 0%'; break;
	case 'g8': _desc = 'intensity to 100%'; break;
	default: console.log('no gesture provided !!')
}
if (_collect && _gesto) console.log(`* * * collecting data for ${_gesto}, ${_desc} * * *`)


app.use(express.static('public'))
app.get('/',(req,res)=>{ res.sendFile(__dirname + '/index.html')})


var remoteIp = '127.0.0.1'
var remotePort = 6448

var udpServer = dgram.createSocket('udp4')

// Get xy coordinates from browser, create an OSC message and send to Wekinator
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

  console.log('osc_js @@')

  socket.on('browser', (gestData) => {
    console.log('browser event', gestData.length, '= 4*20')
    console.log(gestData)
    if (gestData.length != 80) {
    	console.log(' --- not a gesture --- ')
    	return;
    }
    
    const args = []

    // for wekinator
    gestData.forEach(element =>{
      args.push({
        type: 'float',
        value: parseFloat(element) || 0
      })
    })

    // save gesture data to its file (for tensorflow)
    const fileName = process.cwd() + '/gesture_data/' + _gesto +'.json';
    fs.readFile(fileName,'utf8',(err, data)=>{
    	if (err) throw err;
    	data = JSON.parse(data)
    	
    	data.data.push(gestData)  //[0.0,1.0])
    	console.log('\n', data.data.length)
    	fs.writeFile( fileName, JSON.stringify(data), 'utf8', err=>{ if (err) console.error(err) })
    })

    const oscMsg = osc.toBuffer({
      oscType: 'message',
      address: '/wek/inputs',
      args: args
    })

    udpServer.send(oscMsg, 0, oscMsg.length, remotePort, remoteIp)
    //console.log('OSC message sent to ' + remoteIp + ':' + remotePort)

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

/*
{
"desc":"intensity 20% down",
"data":[]
}*/
