'use strict';
function log(){ console.log(...arguments);}

const tf = require('@tensorflow/tfjs')
const fs = require('fs')
//import * as tf from '@tensorflow/tfjs';

const dataFiles = ['g1','g4','g7'] //,'g8']
const allData = {},
	  allLabels = {},
	  testData = {};
const zeros = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // for 20 gestures

const gests = {
		0: '20% down',
		1: '20% up',
		6: '0% Off',
		7: '100%'
}


getFileData()
.then(rawData=>{
	log('rawData?',Object.keys(rawData))
	//return;
	const flattenedData = []
	const trainLabels = [];
	const maxGs = 210; // i have only 10 gesture for g1 now
	// create labels array for each gesture
	Object.keys(rawData).map( g =>{
		
		// get index where to put 1 into labels
		const index = parseInt(g.replace('g','')) -1;
		const thisLabels = JSON.parse(JSON.stringify(zeros))
		thisLabels[index] = 1;
		allLabels[g] = thisLabels;
		//log(' -',rawData[g].length, 'in', g)
		// reduce dataPoints for each gestures to only 20, since its so few
		const newx = rawData[g].splice(0,maxGs)//.map(arr=>arr.splice(0,2)) // just for debug
		flattenedData.push(...newx)
			
		// put labels into same shape = 10 x [20 x 1]
		for (let i=0; i<maxGs; i++){
			trainLabels.push(index)
		}
		//log(g,'has ', rawData[g].length,'gestures')
				
		// set test data
		testData[g] = rawData[g].splice(0, rawData[g].length)
		log(g, 'tests', testData[g].length)

		//log('tests?', rawData[g].length-1, testData[g].length)
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
	log('onehots.shape',onehots.shape)
	const labels = tf.oneHot(onehots, numGestures)	// second arg (num classes?) has to match units in layer 1
	const shape = 80 // has to match length of inside array(80)
	//const ys = tf.tensor1d([0,1,0,0],[[4,1]])
	//const ys = tf.tensor2d([[0],[1],[1],[0]])
	
	const l1 = tf.layers.dense({ units: numGestures, inputShape: shape, activation: 'softmax' })
	const l2 = tf.layers.dense({ units: 40, activation: 'sigmoid'})
	const l3 = tf.layers.dense({ units: 18, activation: 'sigmoid'})
	
	const output = tf.layers.dense({ units: numGestures, activation: 'softmax'})
	// https://medium.com/tensorflow/a-gentle-introduction-to-tensorflow-js-dba2e5257702
	model.add(l1)
	model.add(l2)
	model.add(l3)
	model.add(output);	// this layer makes loss somewhat smaller
	
	//model.add(tf.layers.dense({ units: 4 , activation: 'sigmoid'}))
	//model.add(tf.layers.dense({ units: 20, activation: 'softmax'}))
		
	const optimizer = tf.train.sgd(0.3);
	model.compile({loss: 'categoricalCrossentropy', optimizer: optimizer })
	
	//train
	model.fit(xs, labels, {
       //batchSize: 1,
       shuffle: true,
       epochs: 100,
       //validationSplit: 0.1,
       //metrics: ['accuracy'],
       callbacks:{
		   onTrainStart:()=>{ console.log('start') },
		   onTrainEnd:  ()=>{ console.log(' -- training complete -- ')},
		   onEpochStart:()=>{log('e')},
		   onEpochEnd: (epochNum,logs)=>log(epochNum, logs)
		}
		
	// predict	
	}).then(async history =>{
		console.log('! model trained !');
		
		/*for (let i=0; i<30; i++){ await testModelRandom() }*/
		dataFiles.map(testModelAllTests)
		
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
		
		return;
		
	}	
}



async function getFileData(){

	console.log('reading data files', process.argv)
	const gest_folder = process.argv[2] ? process.argv[2].replace('--','') : null;
	log('gest_folder', gest_folder)
	
	if (!gest_folder) {
		log('!!  provide folder name ("gesture_data...")')
		process.exit(0)
	}
	
	const alls = new Promise((resolve, reject)=>{
		dataFiles.map((name,i) =>{
		    const fileName = process.cwd() + '/' + gest_folder  + '/' + name +'.json';
		    let data = fs.readFileSync(fileName)	    
		    data = JSON.parse(data)
	    	    console.log(data.data.length)
	    	    allData[name] = data.data
	    	    if (i == dataFiles.length-1) resolve(allData)
		}) 
	})
	return await alls;
}