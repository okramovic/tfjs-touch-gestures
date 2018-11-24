'use strict';
function log(){ console.log(...arguments);}

const tf = require('@tensorflow/tfjs')
const fs = require('fs')
//import * as tf from '@tensorflow/tfjs';

const dataFiles = ['g1','g4','g7','g8']
const allData = {},
	  allLabels = {},
	  testData = {};
const zeros = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // for 20 gestures


getFileData()
.then(rawData=>{
	log('rawData?',Object.keys(rawData))
	
	const flattenedData = []
	const trainLabels = [];
	const maxGs = 20 //30; // i have only 10 gesture for g1 now
	// create labels array for each gesture
	Object.keys(rawData).map( g =>{
		
		// get index where to put 1 into labels
		const index = parseInt(g.replace('g','')) -1;
		const thisLabels = JSON.parse(JSON.stringify(zeros))
		thisLabels[index] = 1;
		allLabels[g] = thisLabels;
		
		// reduce dataPoints for each gestures to only 10, since its so few
		const newx = rawData[g].splice(0,maxGs)//.map(arr=>arr.splice(0,2)) // just for debug
		log(newx)
		rawData[g] = newx
		flattenedData.push(...rawData[g])
			
		// put labels into same shape = 10 x [20 x 1]
		for (let i=0; i<maxGs; i++){
			trainLabels.push(index) //trainLabels.push(thisLabels)
		}
		log(g,'has ', rawData[g].length,'gestures')
	})
	log('finals', flattenedData.length, trainLabels.length)

	doModel(flattenedData, trainLabels)
})

async function doModel(dataPoints, trainLabels){
	if (dataPoints.length != trainLabels.length) return log('wierd data');
	
	//log(dataPoints)
	//log('\n')
	log(trainLabels)
	
	const model = tf.sequential()

	//const units = Math.floor(dataPoints.length*0.8)
	//log('all', dataPoints.length, trainLabels.length)
	const aa = [
		[0,0,0,0,0],
		[1,1,1,1,1],
		[0,0,0,0,0],
		[3,3,3,3,3]
	]
	const xs = tf.tensor2d(aa) // aa,[4,3],'int32' //[[0,0],[0,1],[1,0],[1,1]]),
	const onehots = tf.tensor1d([0,1,0,2], 'int32');
	onehots.print()
	const labels = tf.oneHot(onehots, 3)	// second arg (num classes?) has to match units in layer 1
	const shape = 5 // has to match length of inside array(later = 80) //[4,3] //tf.tensor([4,3])
	//const ys = tf.tensor1d([0,1,0,0],[[4,1]])
	//const ys = tf.tensor2d([[0],[1],[1],[0]])
	//const xs = tf.input({shape: })//tf.tensor(aa)	// tf.tensor2d(dataPoints, [80,80])			//, [40,80,1])
	labels.print()
	//log(labels)
	const l1 = tf.layers.dense({ units: 3, inputShape: shape, activation: 'softmax' })
	model.add(l1)
	//const l2 = tf.layers.dense({ units: 8, activation: 'sigmoid'})
	//model.add(l2)	// this layer makes loss somewhat smaller
	//model.compile({optimizer: 'sgd', loss: 'categoricalCrossentropy', lr:0.1})
	//const labels = tf.tensor2d([5,6,7,8],[4,1])//tf.tensor1d(trainLabels,80) //tf.tensor2d(trainLabels) //, [trainLabels.length,20])
	
	//model.add(tf.layers.dense({ units: 4 , activation: 'sigmoid'}))
	//model.add(tf.layers.dense({ units: 20, activation: 'softmax'}))
		
	const optimizer = tf.train.adam(0.2);
	model.compile({loss: 'categoricalCrossentropy', optimizer: optimizer }) // categoricalCrossentropy
	
	model.fit(xs, labels, {
       //batchSize: 1,
       epochs: 20,
       callbacks:{
		   onTrainStart:()=>{ console.log('start') },
		   onTrainEnd:  ()=>{ console.log(' -- training complete -- ')},
		   onEpochStart:()=>{log('e')},
		   onEpochEnd: (epochNum,logs)=>log(logs)
		}
	}).then( x=> console.log('! hoy !'))
	
	return;

	const fitConfig = {
		epochs: 50,
		//shuffle: true,
		//validationSplit: 0.2,
		callbacks:{
			onTrainStart:()=> log('training started'),
			onTrainEnd: ()=> { log(' -- training complete -- ')},
			onEpochEnd: (epochNum,logs)=> log(logs)
		}
	}
	
	model.fit(xs, labels, fitConfig).then(()=>{
		//console.log('epochs elapsed')
		//model.predict(tf.tensor2d([12],[1,1])).print()
	})		
}



async function getFileData(){

	console.log('reading data files')
	const alls = new Promise((resolve, reject)=>{
		dataFiles.map( name =>{
		    const fileName = process.cwd() + '/gesture_data/' + name +'.json';
		    let data = fs.readFileSync(fileName)	    
		    data = JSON.parse(data)
	    	    console.log(data.data.length)
	    	    allData[name] = data.data
	    	    if (name == 'g8') resolve(allData)
		}) 
	})
	return await alls;
}
