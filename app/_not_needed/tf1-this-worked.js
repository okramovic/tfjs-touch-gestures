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
	//log('finals', flattenedData.length, trainLabels.length)

	doModel(flattenedData, trainLabels)
})

async function doModel(dataPoints, trainLabels){
	if (dataPoints.length != trainLabels.length) return log('wierd data');
	
	//log(dataPoints)
	//log('\n')
	//log(trainLabels)
	
	const model = tf.sequential()

	//const units = Math.floor(dataPoints.length*0.8)
	//const dataCount = dataPoints.length;
	//log('all', dataPoints.length, trainLabels.length)
	//log('all', dataPoints.length, trainLabels.length)
	const aa = [
		[0,0,0],
		[1,1,1],
		[2,2,2],
		[3,3,3]
	]
	const xs = tf.tensor2d(aa,[4,3],'int32') //[[0,0],[0,1],[1,0],[1,1]]),
	const onehots = tf.tensor1d([0,1,0,1],'int32');
	onehots.print()
	const ys = tf.oneHot(onehots, 2)
	const shape = 3//[4,3] //tf.tensor([4,3])
	//const ys = tf.tensor1d([0,1,0,0],[[4,1]])
	//const ys = tf.tensor2d([[0],[1],[1],[0]])
	//const xs = tf.input({shape: })//tf.tensor(aa)	// tf.tensor2d(dataPoints, [80,80])			//, [40,80,1])
	xs.print()
	//log(labels)
	//return;
	model.add(tf.layers.dense({units:2, inputShape:shape, activation: 'sigmoid'}))
	//model.add(tf.layers.dense({units:4, activation: 'sigmoid'}))
	//model.compile({optimizer: 'sgd', loss: 'categoricalCrossentropy', lr:0.1})
	//const labels = tf.tensor2d([5,6,7,8],[4,1])//tf.tensor1d(trainLabels,80) //tf.tensor2d(trainLabels) //, [trainLabels.length,20])
	//log(labels.shape);
	
	// for xs tried: inputShape: [1,80]
	//model.add(tf.layers.dense({ units: 4 , activation: 'sigmoid'}))	// inputShape: xs.shape,   [dataCount,1]
	//model.add(tf.layers.dense({ units: 20, activation: 'softmax'}))
		
	const lr = 0.2;
	const optimizer = tf.train.sgd(lr);
	model.compile({loss: 'categoricalCrossentropy', optimizer: optimizer }) // categoricalCrossentropy
	
	model.fit(xs, ys, {
       //batchSize: 1,
       epochs: 50,
       callbacks:{
		   onTrainStart:()=>{console.log('start')},
		   onTrainEnd:  ()=>{ console.log(' -- training complete -- ')},
		   onEpochEnd: (epochNum,logs)=> log(logs)
		}
	}).then( x=> console.log('! hoy !'))
	
	return;
	//const xs = tf.tensor2d([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [10, 1]);
	//const ys = tf.tensor2d([2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  [10, 1]);

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
