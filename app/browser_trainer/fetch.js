// test fetching model

console.log('fetch?')

const test1 = [0.58333,0.38036,0,0,0.57778,0.40714,0,0,0.575,0.43036,0,0,0.56944,0.47143,0,0,0.56389,0.49286,0,0,0.55833,0.51964,0,0,0.55833,0.53571,0,0,0.55556,0.56071,0,0,0.55278,0.56786,0,0,0.55278,0.57679,0,0,0.55,0.57857,0,0,0.55,0.58214,0,0,0.55,0.58393,0,0,0.55,0.58929,0,0,0.55,0.58929,0,0,0.55,0.59107,0,0,0.55,0.59107,0,0,0.55,0.59286,0,0,0.55,0.59286,0,0,0.55,0.59286,0,0];

load()
async function load(){
	
	const model = await tf.loadModel('/model_a.json')
	console.log('awaited', model)
	
	//test it
	const res = await model.predict(tf.tensor2d(test1,[1,80]))//.print() //then(x=log('x',x))
	console.log('expect:', 1, res.dataSync())
}

