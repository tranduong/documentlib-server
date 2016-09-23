var config = require('../config/config');
var math   = require("mathjs");

function Comparator() {

}

var comparator = Comparator.prototype;

// compare two vector by cosine
comparator.consineSimilarity = function(vD1, vD2){
	var similarity = 0.0;
	// console.log("=============d1 vector=============");
	// console.log(vD1.length);
	// console.log("=============d2 vector=============");
	// console.log(vD2.length);
	
	var num = 0.0;
	var lv1 = 0.0; // length of vector of document 1
	var lv2 = 0.0; // length of vector of document 2
	var term_freq1 = 0;
	var term_freq2 = 0;	
	
	for (var key in vD1)
	{
		//console.log("working + " + i);
		if ( vD1[key] != null )
		{
			//console.log(vD1[key]);
			if (vD1[key].length == 0)
			{
				term_freq1 = 0;
			}
			else if (vD1[key].length == 1){
				term_freq1 = vD1[key][0].term_freq;
				//console.log("Term1 freq = " + term_freq1);
			}
			else if (vD1[key].length > 1){
				term_freq1 = 0;
				for ( var j = 0; j < vD1[key].length; j++ )
				{
					term_freq1 += vD1[key][j].term_freq;
					//console.log("Term1 freq = " + term_freq1);
				}
			}
		}
		else{
			term_freq1 = 0;
		}
		//console.log("working");
		if ( vD2[key] != null )
		{
			if (vD2[key].length == 0)
			{
				term_freq2 = 0;
			}
			else if (vD2[key].length == 1){
				term_freq2 = vD2[key][0].term_freq;
				//console.log("Term2 freq = " + term_freq2);
			}
			else if (vD2[key].length > 1){
				term_freq2 = 0;
				for ( var j = 0; j < vD2[key].length; j++ )
				{
					term_freq2 += vD2[key][j].term_freq;
					//console.log("Term2 freq = " + term_freq2);
				}
			}
		}
		else
		{
			term_freq2 = 0;
		}
		
		num = num + term_freq1 * term_freq2;
		lv1 = lv1 + term_freq1 * term_freq1;
		lv2 = lv2 + term_freq2 * term_freq2;
	}
	
	//console.log("num = " + num + ", lv1 = " + lv1 + ", lv2 = " + lv2);
	
	
	lv1 = math.sqrt(lv1);
	lv2 = math.sqrt(lv2);
	
	var den = lv1 * lv2;
	if ( den != 0 ){
		similarity = (num / den);
	}
	else
	{
		similarity = 0;
	}
	
	// console.log("=============similarity vector=============");
	// console.log(similarity);
	return similarity;
}

module.exports = Comparator;