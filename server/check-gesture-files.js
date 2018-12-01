'use strict';
function log(){console.log(...arguments);}

const files = ['g1','g4','g7','g8','g10','g11']
const fs = require('fs')
const data_folder = process.argv[2]? process.argv[2].replace('--','') : 'gesture_data_3';
 
log('checking files: ', files)
log('data_folder', data_folder)

getGestureData()
.then( data=>{
	//log(data)
	
	data.map(obj=>{
		if (!obj.data instanceof Array) throw `${obj.name} data is not array`
		log(obj.name, '   ', obj.data.length)
		obj.data.map((gest,i)=>{
			if (gest.length != 80) throw `${obj.name}, gest ${i} is not 80 long`
			if (!gest.every(isValid)) throw `invalid coord point in: ${obj.name}`
			// check that everything is not 0
			if (gest.every(isZero)) throw `all are zeros in: ${obj.name} `
		})
	})
	log('all files seem ok')
	
	function isValid(num){
		return typeof num == 'number' && (num >=-1 && num<=1)
	}
	function isZero(num){
		return num === 0
	}
	
})

async function getGestureData(){
	
	const promises = files.map(async file =>{
		
		const path = process.cwd() + '/' + data_folder + '/' + file + '.json'
		let oneGestData = fs.readFileSync(path, 'utf8')
		oneGestData= JSON.parse(oneGestData).data
		return {
			name: file,
			data: oneGestData
		}
	})
	
	return await Promise.all(promises)
	
	
}
