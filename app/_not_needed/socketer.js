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

app.use(express.static('public'))
app.get('/',(req,res)=>{ res.sendFile(__dirname + '/index.html')})

io.on('connection', (socket) => {
  console.log('user connected')

  //const options = { send: { port: 11245 } }
  //const osc_js = new OSC({ plugin: new OSC.DatagramPlugin(options) })

  //console.log('osc_js',osc_js)

  /*osc_js.on('/wek/outputs', (message) => {
            console.log('msg', message.args)
            io.emit('controls', message.args);
  })

  osc_js.on('open', () => {
       console.log('osc open')
       //osc.send(new OSC.Message('/response', Math.random()))
  })*/

  //osc_js.open({port: 12000})

  socket.on('browser', (gestData) => {
    console.log('browser event', gestData.length, '= 4*20')
    console.log(gestData)
    if (gestData.length != 80) {
    	console.log(' --- not a gesture --- ')
    	return;
    }
    //if (!_gesto) console.log('not recording')
    

    // save gesture data to its file (for tensorflow)
    /*const fileName = process.cwd() + '/' + gest_folder + '/' + _gesto +'.json';
    fs.readFile(fileName,'utf8',(err, data)=>{
    	if (err) throw err;
    	data = JSON.parse(data)
    	
    	data.data.push(gestData)  //[0.0,1.0])
    	
    	fs.writeFileSync( fileName, JSON.stringify(data), 'utf8') 
    	console.log(_gesto, data.data.length)
    	/*, err=>{ 
				//if (err) console.error(err) 
				//console.log('\n', data.data.length)
		})
    })*/

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

http.listen(3050, ()=>{ console.log('http on 3050')})

//exports.io = io
