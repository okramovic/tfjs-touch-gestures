'use strict';

// server-side training - old (browser side allows saving model)

function log(){ console.log(...arguments);}

const tf = require('@tensorflow/tfjs')
const fs = require('fs')


const gests = {
		0: '20% down',
		1: '20% up',
		6: '0% Off'
		//,7: '100%'
}
const dataFiles = ['g1','g4','g7'] //,'g8']
const allData = {},
	  allLabels = {},
	  testData = {};
const zeros = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // for 20 gestures

let epochsDesired = 50; // default;


getFileData()
.then(rawData=>{
	log('using data for gestures',Object.keys(rawData))
	
	const flattenedData = []
	const trainLabels = [];
  const maxGs = 65;
  
	// create labels array for each gesture
	Object.keys(rawData).map((g,keyI) =>{
		
		// get index where to put 1 into labels
		const index = parseInt(g.replace('g','')) -1;
		const thisLabels = JSON.parse(JSON.stringify(zeros))
		thisLabels[index] = 1;
		allLabels[g] = thisLabels;
		//log(' -',rawData[g].length, 'in', g)
		// reduce dataPoints for each gestures to only few tens, since its so few
		const newx = rawData[g].splice(0,maxGs)//.map(arr=>arr.splice(0,2)) // just for debug
		flattenedData.push(...newx)
			
		log('      - index', index)
		// put labels into same shape = 10 x [20 x 1]
		for (let i=0; i<maxGs; i++){
			trainLabels.push(keyI)
		}
		//log(g,'has ', rawData[g].length,'gestures')
				
		// set test data
		testData[g] = rawData[g].splice(0, rawData[g].length)
		log(`     tests for ${g}: ${testData[g].length}`)
	})
	log('\nfinals', flattenedData.length, trainLabels.length, )

	doModel(flattenedData, trainLabels)
})

async function doModel(dataPoints, trainLabels){
	if (dataPoints.length != trainLabels.length) return log('wierd data');
	
	//log(dataPoints)
	//log(trainLabels)
	const numGestures = dataFiles.length;
	const model = tf.sequential()

	const xs = tf.tensor2d(dataPoints) // aa,[4,3],'int32'
	
	const onehots = tf.tensor1d(trainLabels, 'int32');
	const labels = tf.oneHot(onehots, numGestures)	// second arg (num classes?) has to match units in layer 1 (lol)
	log('one hot labels tensor:')
	labels.print()
	//const ys = tf.tensor1d([0,1,0,0],[[4,1]])
	//const ys = tf.tensor2d([[0],[1],[1],[0]])
	
	const shape = 80 // has to match length of inside array(80)
	
	
	model.add( tf.layers.dense({ units: 80, inputShape: shape, activation: 'sigmoid' }) )
	model.add( tf.layers.dense({ units: 40, activation: 'softmax'}) )
	//model.add( tf.layers.dense({ units: 16, activation: 'sigmoid'}) )
	//model.add( tf.layers.dense({ units: 16, activation: 'sigmoid'}) )
	//model.add( tf.layers.dense({ units:  8, activation: 'sigmoid'}) )
	
	// https://medium.com/tensorflow/a-gentle-introduction-to-tensorflow-js-dba2e5257702
	const output = tf.layers.dense({ units: numGestures, activation: 'softmax'})
	model.add(output);	// this layer makes loss somewhat smaller (lol, one of first comments here)
	
		
	const optimizer = tf.train.adam(0.008); // adam w 0.008 is way better (100% training accur.) than any sgd
	model.compile({loss: 'categoricalCrossentropy', optimizer: optimizer })
	
	//train
	model.fit(xs, labels, {
       //batchSize: 1,
       shuffle: true,
       epochs: epochsDesired,
       //validationSplit: 0.1,
       //metrics: ['accuracy'],
       callbacks:{
		   onTrainStart:()=>{ console.log('start') },
		   onTrainEnd:  ()=>{ console.log(' -- training complete -- ')},
		   onEpochStart:()=>{log('e')},
		   onEpochEnd: (epochNum,logs)=>{if (epochNum%10==0)log(epochNum, logs)}
	   }
		
	// predict	
	}).then(async history =>{
		console.log('! model trained !');
		
		/*for (let i=0; i<30; i++){ await testModelRandom() }*/
		dataFiles.map(testModelAllTests) // see test results
		openWebInterface(model)
		
	})	
	async function testModelAllTests(gest){
			
			// get test samples of each gesture
			// predict for each of gestures
			testData[gest].map(async (g,i)=>{
				const res = await model.predict(tf.tensor2d(g,[1,80]))
				log('\nexpect', gest, res.dataSync())
			})
			
	}
	async function testModelRandom(){
		// pick random gesture from tests
		const tgest = dataFiles[ Math.floor(Math.random()*dataFiles.length)] //'g1'
		const i = Math.floor(Math.random()*testData[tgest].length)	// pick one random sample
		log(i.toString(),'of', testData[tgest].length)
		const sample = testData[tgest][i];
		
		//test it
		const res = await model.predict(tf.tensor2d(sample,[1,80]))//.print() //then(x=log('x',x))
		log('expect:', tgest, res.dataSync())
	}	
}

// let user test gestures
function openWebInterface(model){
	console.log('web live, connect and start testing')
	const express = require('express'),
		  app = express(),
		  http = require('http').Server(app)
		  //fs = require('fs'),
		  //osc = require('osc-min'),
		  //OSC = require('osc-js');
	let io = require('socket.io')(http);
	
	app.use(express.static('public'))
	app.get('/',(req,res)=>{ res.sendFile(__dirname + '/index.html')})

	io.on('connection', (socket) => {
		console.log('user connected')
		
		socket.on('browser', async (gestData) => {
			log('\n')
			console.log('browser data', gestData.length)
			
			if (gestData.length != 80) return console.log(' --- not a gesture --- ');
			
			const pred = await model.predict(tf.tensor2d(gestData,[1,80]))
			const vals = pred.dataSync()
			log('\nexpect', ...vals)
			const max = Math.max(...vals),
			resIndex = vals.indexOf(max)

			let g = { 
				0: '20% down',
				1: '20% up',
				2: '0% Off'
			};
			
			// get gesture description
			log(`is it '${g[resIndex]}'? ${max}`)
		})
	})
	http.listen(3050, ()=>{ console.log('model listens on 3050')})
}


async function getFileData(){

	log('\n')
	//console.log('reading data files', process.argv)
	const gest_folder = process.argv[2] ? process.argv[2].replace('--','') : null;
	log('data folder:', gest_folder)
	
	
	
	if (!gest_folder) {
		log('!!  provide folder name ("gesture_data...")')
		process.exit(0)
	}
	
	epochsDesired = process.argv[3] ? parseInt(process.argv[3].replace('--','')) : epochsDesired;
	log('epochs:', epochsDesired)
	log('lr:', 0.008)
	log('\n')
	
	const alldata = new Promise((resolve, reject)=>{
		dataFiles.map((name,i) =>{
		    const fileName = process.cwd() + '/' + gest_folder  + '/' + name +'.json';
		    let data = fs.readFileSync(fileName)	    
		    data = JSON.parse(data)
	    	    console.log(name, data.data.length)
	    	    allData[name] = data.data
	    	    if (i == dataFiles.length-1) resolve(allData)
		}) 
	})
	return await alldata;
}