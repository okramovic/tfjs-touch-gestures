'use strict'

const express = require('express'),
app = express(),
fs = require('fs');
global.fetch = require('node-fetch');

app.use(express.static('models'))
app.get('/',(req,res)=>{ res.sendFile(__dirname + '/index.html')})
app.get('/test',(req,res)=>{res.end('serve-model is running')}) // for testing end of child process
/*app.get('/model', (reg,res)=>{
	console.log(req.query)
	res.end();
})*/

app.listen(3000, ()=>console.log('model served on 3000'))
