'use strict';
function log(){ console.log(...arguments);}
log('traiiin')

const modelName = 'model_b2'
let model;


const gests = {
		0: '20% down',
		1: '20% up',
		6: '0% Off'
		,7: '100%'
		,
}
const dataFiles = ['g1','g4','g7','g8','g10','g11','g19']
const allData = {},
	  allLabels = {},
	  testData = {};
const zeros = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];  // for 20 gestures

async function fetchAllData(){
	
	const result = {}; // this will be passed to next function
	
	const promises = dataFiles.map((fn,fileI) =>
		fetch(`/data/?file=${fn}.json`)
		.then(res=>res.json())
		.then(json=>{
			return json.data;
		})
	)
	const x = await Promise.all(promises); // will be just array
	// next functions expect result: { g1: arrayOfGestures }
	x.map((dataObj,i)=>{ 
		log('   ',dataFiles[i], dataObj instanceof Array ? 'array': 'not array', dataObj.length)
		const key = dataFiles[i]
		result[key] = dataObj
	})
	
	
	return result //x//allData;
}


fetchAllData()
// split data into sets
.then(rawData=>{
	log('using data for gestures',Object.keys(rawData), rawData)
	
	const flattenedData = []
	const trainLabels = [];
	const maxGs = 100; // i have only 10 gesture for g1 now
	// create labels array for each gesture
	Object.keys(rawData).map((g,keyI) =>{
		
		// get index where to put 1 into labels
		const index = parseInt(g.replace('g','')) -1;
		const thisLabels = JSON.parse(JSON.stringify(zeros))
		thisLabels[keyI] = 1;
		allLabels[g] = thisLabels;
		
		// reduce dataPoints for each gestures to only cca 100(or maxGs/max gestures), since its so few
		const newxs = rawData[g].splice(0,maxGs)//.map(arr=>arr.splice(0,2)) // just for debug
		flattenedData.push(...newxs)
			
		//log(g,'      - index', index, keyI)
		
		// put labels into same shape = 10 x [20 x 1]
		for (let i=0; i<maxGs; i++){
			trainLabels.push(keyI) //index)
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
	
	log(dataPoints)
	log('trainLabels',trainLabels)
	const numGestures = dataFiles.length;
	model = tf.sequential()
	const xs = tf.tensor2d(dataPoints) // aa,[4,3],'int32'
	
	const onehots = tf.tensor1d(trainLabels, 'int32');
	const labels = tf.oneHot(onehots, numGestures)	// second arg (num classes?) has to match units in layer 1 (lol)
	log('one hot labels tensor:')
	labels.print()
	//const ys = tf.tensor1d([0,1,0,0],[[4,1]]) //const ys = tf.tensor2d([[0],[1],[1],[0]])
	
	const shape = 80 // has to match length of inside array(80)
	model.add( tf.layers.dense({ units: 80, inputShape: shape, activation: 'relu' }) )
	//model.add( tf.layers.dense({ units: 40, activation: 'relu'}) )
  //model.add( tf.layers.dense({ units: 40, activation: 'relu'}) )
  //model.add( tf.layers.dense({ units: 40, activation: 'relu'}) ) // @ around 100 datapoints per class, these layers dont improve accuracy
  //model.add( tf.layers.dense({ units: 30, activation: 'relu'}) ) //
  //model.add( tf.layers.dense({ units: 30, activation: 'relu'}) )
  //model.add( tf.layers.dense({ units: 30, activation: 'relu'}) ) //
  //model.add( tf.layers.dense({ units: numGestures*2, activation: 'relu'}) ) //
  model.add( tf.layers.dense({ units: numGestures*2, activation: 'relu'}) ) //

	//model.add( tf.layers.dense({ units:  8, activation: 'sigmoid'}) )
	
	// https://medium.com/tensorflow/a-gentle-introduction-to-tensorflow-js-dba2e5257702
	const output = tf.layers.dense({ units: numGestures, activation: 'softmax'})
	model.add(output);	// this layer makes loss somewhat smaller (lol, one of first comments here)
	const optimizer = tf.train.adam(0.0015); // adam w 0.008 is way better (100% training accur.) than any sgd
  model.compile({loss: 'categoricalCrossentropy', optimizer: optimizer, metrics: ['accuracy'] })
  



  //train
  const epochsDesired = 3000; // will default to 100;
	log(' --------------------------------------     about to fit model for', epochsDesired || 100, 'epochs')

	model.fit(xs, labels, {
       batchSize: 10, //dataPoints.length,  // put all train datapoints to train?
       stepsPerEpoch: 1,
       shuffle: true,
       epochs: epochsDesired || 100,
       validationSplit: 0.1,
       callbacks:{
		   onTrainBegin:()=> log(' == training started == '),
		   onTrainEnd:  ()=> log(' -- training complete -- '),
		   //onEpochBegin:()=>{log('e')},
		   onEpochEnd: (epochNum,logs)=>{ log(epochNum, logs)}
     }
     
	// test model	+ save it
	}).then(async history =>{
    log('! model trained !');
    
    
    // unhide saving options in html
    document.querySelector('#savingDiv').style.display = 'block'
    document.querySelector('#saveModel').addEventListener('click', async ev =>{

        let name = (document.querySelector('input[type="text"]').value || 'test_model') + new Date().toDateString()

        log('saving model...', name)
        await model.save(`downloads://${name}`);
        log('[[[ saved ]]]')
    })

		
		dataFiles.map(testModelAllTests) // log test results
	})

	async function testModelAllTests(gest){
			
			// get test samples of each gesture
			// predict for each of gestures
			testData[gest].map(async (g,i)=>{
          const res = await model.predict(tf.tensor2d(g,[1,80]))
          const results = res.dataSync()
          const max = Math.max(...results)
          
          if (gest == dataFiles[results.indexOf(max)]) log('\nexpect', gest, dataFiles[results.indexOf(max)],` ( of ${testData[gest].length} tests )`)
          else {
            log('\nexpect', gest, dataFiles[results.indexOf(max)],` ( of ${testData[gest].length} tests )`)
            console.table( results)
          }
			})
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
			
			// spit out gesture description
			log(`is it '${g[resIndex]}'? ${max}`)
		})
	})
	http.listen(3050, ()=>{ console.log('model listens on 3050')})
}

