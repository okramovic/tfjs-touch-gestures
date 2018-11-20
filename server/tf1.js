const tf = require('@tensorflow/tfjs')

//import * as tf from '@tensorflow/tfjs';
//console.log(process.argv)



const model = tf.sequential()

model.add(tf.layers.dense({units: 1, inputShape: [1]}))


model.compile({loss: 'meanSquaredError', optimizer: 'adam'})

const xs = tf.tensor2d([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [10, 1]);
const ys = tf.tensor2d([2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  [10, 1]);

model.fit(xs, ys, {epochs: 550}).then(()=>{
	console.log('epochs elapsed')
	model.predict(tf.tensor2d([12],[1,1])).print()
})


async function x(){
console.log('ola')
}

console.log(!!tf)