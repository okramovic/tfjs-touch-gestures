module.exports = {
	map: function(n, start1, stop1, start2, stop2, withinBounds) {
	  //p5._validateParameters('map', arguments);
	  let newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
	  if (!withinBounds) {
		return newval;
	  }
	  if (start2 < stop2) {
		return this.constrain(newval, start2, stop2);
	  } else {
		return this.constrain(newval, stop2, start2);
	  }
	},
	
	rgbToHsl: function(r, g, b){	// it outputs Hue in set 0-360 degrees
      r /= 255, g /= 255, b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if(max == min){
          h = s = 0; // achromatic
      } else {
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
              case r: h = (g - b) / d ; break;
              case g: h = 2 + ( (b - r) / d); break;
              case b: h = 4 + ( (r - g) / d); break;
          }
          h*=60;
          if (h < 0) h +=360;
      }
	  return([h, s, l]);
	}, 
	
	// Assumes h, s, and l are contained in the set [0, 1] and
	// returns r, g, and b in the set [0, 255]
	hslToRgb: function (h, s, l){
		let r, g, b;

		if(s == 0){
			r = g = b = l; // achromatic
		}else{
			let hue2rgb = function hue2rgb(p, q, t){
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			let p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
}




/*
//old color "clock" function 
			prevHue = rgbToHsl(r, g, b)
			console.log('prevHue',prevHue)
			timer = setInterval(()=>{
				prevHue[0] += 10
				if (prevHue[0]>=360) prevHue[0] -= 360
				console.log('new h', prevHue[0], prevHue[0]/360)
				
				const newHue = [prevHue[0]/360, prevHue[1], prevHue[2]]
				
				const rgbs = hslToRgb(...newHue)
				
				//console.log('   rgbs', rgbs)
				sendToArdu('r', rgbs[0])
				sendToArdu('g', rgbs[1])
				sendToArdu('b', rgbs[2])
			},2000) // arduino cant make it with faster interval
 */
