'use strict'

const express = require('express'),
app = express(),
fs = require('fs');
global.fetch = require('node-fetch'); //-polyfill'),


const tf = require('@tensorflow/tfjs')

test()
async function test(){
	//await tf.loadModel('https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fmodel_a.json?1543526529220')
	//await tf.loadModel('https://cdn.glitch.com/c825bb9b--7cd4bcff6292%2Fmodel_a.json?1543526067317')
	//await tf.loadFrozenModel('https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fmodel_a.json?1543526529220',
	//						 'https://cdn.glitch.com/c825bb9b-ffe7-4f29-b89f-7cd4bcff6292%2Fmodel_a.weights.bin?1543526036021')
	//console.log('after loading model')
}

app.use(express.static('browser_trainer'))
app.get('/',(req,res)=>{ res.sendFile(__dirname + '/index.html')})
app.get('/data',(req,res)=>{
	console.log('req.query',req.query.file)
	fs.readFile('gesture_data_3/' + req.query.file, (err, data)=>{
		if (data){
			res.send(data)
		}
	})
})
app.get('/model', (reg,res)=>{
	console.log(req.query)
	
	res.end();
})

app.listen(3000, ()=>console.log('train on 3000 - serving files in frontend training'))
