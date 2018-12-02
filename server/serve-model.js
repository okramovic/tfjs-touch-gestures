'use strict'

const express = require('express'),
app = express(),
fs = require('fs');
global.fetch = require('node-fetch');

app.use(express.static('models'))
app.get('/',(req,res)=>{ res.sendFile(__dirname + '/index.html')})
/*app.get('/model', (reg,res)=>{
	console.log(req.query)
	res.end();
})*/

app.listen(3000, ()=>console.log('model served on 3000'))
