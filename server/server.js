const express = require('express')
const app = express()
const http = require('http').Server(app)
//var io = require('socket.io')()
let io = require('socket.io')(http)
var osc = require('osc-min')
var dgram = require('dgram')

const OSC = require('osc-js')

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

  socket.on('browser', (data) => {
    console.log('browser event', data.length)
    console.log(data)
    var args = []

    data.forEach(function (element) {
      args.push({
        type: 'float',
        value: parseFloat(element) || 0
      })
    })

    var oscMsg = osc.toBuffer({
      oscType: 'message',
      address: '/wek/inputs',
      args: args
    })

    udpServer.send(oscMsg, 0, oscMsg.length, remotePort, remoteIp)
    console.log('OSC message sent to ' + remoteIp + ':' + remotePort)

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
