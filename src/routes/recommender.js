'use strict';

var express = require('express');
var recommender 	= express.Router();
var Utils 			= require('../utils/Utils');
var Utility 		= new Utils();
var Neo4JCommander 	= require('../utils/Neo4JCommander');
var Document    	= require('../models/Document');
var Comparator 		= require('../utils/Comparator');
var comparer 		= new Comparator();
var Elastic  		= require('../utils/ElasticSearchConnector');
var sleep			= require('sleep');

//Middle ware that is specific to this router
recommender.use(function timeLog(req, res, next) {
  //console.log('Time: ', Date.now());
  next();
});

/////////////////////// RECOMMENDATION ALGORITHM IMPLEMENTATION PART //////////////////////////////////////////
recommender.post('/recommendTopN', Utility.ensureAuthorized,function(req,res){
	//console.log("Recommend Top N");
	//console.log(req.body);
	res.json('{"result":"Success"}');
});

function printPrototype(obj, i) {
    var n = Number(i || 0);
    var indent = Array(2 + n).join("-");

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            console.log(indent, key, ": ", obj[key]);
        }
    }

    if(obj) {
        if(Object.getPrototypeOf) {
            printPrototype(Object.getPrototypeOf(obj), n + 1);
        } else if(obj.__proto__) {
            printPrototype(obj.__proto__, n + 1);
        }
    }
}

/* recommender.post('/testPromise', function(req,res){

});

recommender.post('/testForLoop', function(req,res){
	// repeater(i) {
	// if( i < length ) {
		 // asyncwork( function(){
		   // repeater( i + 1 )
		 // })
	  // }
	// }
	// repeater(0)
});

recommender.post('/testForLoop', function(req,res){
		// var FinalResult = "";

		// WaterfallOver(paths, function(path, report) {
			// fs.readFile(path, 'utf8', function(err, data) {

					// here we wait for random time
					// setTimeout(function() {
						// FinalResult += data + " ";

						// report();
					// }, Math.floor(Math.random() * 10));

				// });
		// }, function() {
			// console.log(FinalResult);
		// });
});
 */

/* ****************************************************************
	This function is the implementation of a simple content-based algorithm
	Data: User u, Threshold δ, number of Recommendations K
	Result: Top-K of Recommendation items set R
	l ← list document rated by u;
	L ← all documents;
	max ← 0, R ← ∅;
	for i = 1 to |L| do
		di in L;
		L ← L - di;
		for j = 1 to |l| do
			dj in l;
			Dij = compare(di, dj);
			if Dij > max then
				max = Dij;
		end
	end
	if max > δ then
		R ← R ∪ di;
	end
	Rank(R) based on 4ij;
	Recommend(Top-K of R);
	end
****************************************************************** */
//recommender.post('/simpleTopN', Utility.ensureAuthorized,function(req,res){
recommender.post('/simpleTopN', function(req,res){
	//console.log("Recommend Top N");
	console.log(req.body);
	var u 		= req.body.user_id; 	// User u
	var thres 	= req.body.threshold; 	// Threshold δ, 
	var K 		= req.body.K_value; 	// number of Recommendations K
	var recommends = [];				// Result: Top-K of Recommendation items set R
	
	// FOR TESTING ALGORITHM
	// u = '57bebede4ce7748824a36846';
	// thres = 0.1;
	// K = 10;
	// Get all document rates by u.
	var ratingDocs 	= [];
	var commander  	= new Neo4JCommander();
	var R 			= [];
	var L			= [];
	var l 			= [];
	
	console.time("simpleTopN");
	
	commander.getAllRatingsDocument(u, function(listRatings){
		
		ratingDocs = listRatings;
		// console.log("Result of the user, relationship and documents ");
		// console.log("==========================================");
		// console.log(listRatings);
		// console.log("==========================================");
		// l ← list document rated by u; 
		l = [];
		for (var k = 0; k < ratingDocs.data.length; k++ )
		{
			l.push(ratingDocs.data[k][2]);
		}
		// console.log("List of documents user rated");
		// console.log("==========================================");
		// console.log(l);
		// console.log("==========================================");
		
		Document.find({isDeleted: false},{isDeleted:1, privacy:1}, null, function(err, docs){
			
			var elasticConnector = new Elastic(); // prepair elastic search connector to get document term vectors
					
			L = docs; // L ← all documents;
			// console.log("List of all documents inside the system");
			// console.log("==========================================");
			// console.log(L);
			// console.log("==========================================");
			
			var di  = null;
			var dj  = null;
			console.log("start processing");
			
			var similarResults = [];
			var timeOut = setTimeout(finalLookupSimilar, 2000);
			// for i = 1 to |L| do
			function finalLookupSimilar() { 
				//console.log('finalLookupSimilar() Done', similarResults); 
				clearTimeout(timeOut);
				//console.log("Start to collect result");			
				if ( similarResults.length > 0 )
				{
					var candidate = null;
					for (var h = 0; h < similarResults.length; h ++)
					{
						candidate = similarResults[h];
						if ( candidate.diff > 0 && candidate.d1 != null && candidate.d2 != null && candidate.diff > thres )
						{
							R.push({doc: candidate.d1, sim: candidate.diff});
						}
					}
					// console.log("working to collect result");				
	
					console.log("Before");
					// console.log("=============");
					console.log(R)
					// console.log("=============");
					//sort R base on Dij i.e. Rank(R) based on 4ij;
					R.sort(function(a, b) {
						return ( ( a.sim > b.sim ) ? -1 : (( a.sim < b.sim ) ? 1 : 0) );
					});
					console.log("After");
					// console.log("=============");
					console.log(R)
					// console.log("=============");
					// return top-K element from R to recommends i.e. Recommend(Top-K of R)
					
					// return the document list as a complement part
					var ids = [];
					
					if ( R.length <= K )
					{
						for (var idx = 0; idx < R.length; idx++)
						{
							//console.log(R[idx]);
							recommends.push(R[idx]);
							ids.push(R[idx].doc._id);
						}
					}
					else
					{
						// extract top-K elements
						for (var idx = 0; idx < K; idx++)
						{
							//console.log(R[idx]);
							recommends.push(R[idx]);
							ids.push(R[idx].doc._id);
						}
					}
					
					// console.log(recommends);
					console.timeEnd("simpleTopN");
					//console.log(ids);
					var returnData = [];
					Document.find({
						'_id': { $in: ids },
						isDeleted: false
							}, null, null,function(err, fullDocs){
						if (err)
						{
							//console.log("Error in retreiving docs: " + err);
							res.json({
								type: false,
								data: "Error occured: "  + err
							});	
						}
						else{
							if ( fullDocs )
							{
								for (var jk = 0; jk < recommends.length; jk++)
								{
									for (var ik = 0; ik < fullDocs.length; ik++)
									{
									
										if ( fullDocs[ik]._id == recommends[jk].doc._id )
										{
											var data = {};
											data.doc = fullDocs[ik];
											data.sim = recommends[jk].sim;
											returnData.push(data);
										}
									}
								}
								
								res.json({
									type: true,
									data: returnData
								});
							}
							else
							{
								res.json({
									type: true,
									data: []
								});
							}
						}
					});
				}
				else{
					res.json({
						type: true,
						data: []
					});
				}
			}
			
			var proceedItems;
			proceedItems = 0;
			// L ← L - di;	
			var stillProcessing;
			stillProcessing = 0;
			var itemsLookupSimilar = L;
			itemsLookupSimilar.forEach(function(itemSim) 
			{
				di = itemSim;
				proceedItems += 1;
				stillProcessing +=  1;	
				
				// console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);	
				// console.log("document id = " + di._id);	
				// console.log("============== take di from L ============");
				// console.log(di);
				// console.log("------------------------------------------");
				// console.log(L);
				// console.log("==========================================");
			
				if ( di.privacy == 'undefined' )
				{
					di.privacy = 'public';
				}
				
				// console.log("document i");
				// console.log("==========================================");
				// console.log(di);
				// console.log("------------------------------------------");

				var objDi = JSON.parse(JSON.stringify(di));
				var objData = {d1: objDi};
				elasticConnector.getTermVectors(di._id, di.privacy, objData, function(resultTermsdi, lastdata){
					var diData = resultTermsdi.data;
					
					var found = false;
					if (diData.found == true )
					{
						found = true;
					}
					
					if ( found )
					{
						// console.log("term vector of document i");
						// console.log("==========================================");
						// console.log(resultTermsdi);
						// console.log("==========================================");			
						// console.log(lastdata);						
						// console.log("==========================================");	
						// for j = 1 to |l| do
						
						var diffResults = [];						
						function finalFindMax() 
						{ 
							// console.log('finalFindMax() got result', diffResults); 
							
							var max = 0;
							var result = null;
							var res = null;
							for (var i = 0; i < diffResults.length; i++)
							{
								res = diffResults[i];
								if ( res.diff > max )
								{
									max = res.diff;
									result = res;
								}
							}
							
							if ( result != null )
							{
								similarResults.push(result);											
							}							
							
							//console.log('similar results now',similarResults);
							process.nextTick(function() {
								stillProcessing -=  1;													
								console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
								console.log("document id = " + lastdata.d1._id);
								if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
									finalLookupSimilar();
								}			
							});										
						}
						
						var itemsFindMax = l;
						if ( itemsFindMax.length > 0 )
						{
							function series(itemFindMax) {
								if(itemFindMax) 
								{
									dj = itemFindMax;
									// console.log("get a document j from l");
									// console.log("==========================================");
									// console.log(dj);
									// console.log("==========================================");

									var privacy = "public";
									if ( dj.privacy != null )
									{
										privacy = dj.privacy;
									}
									
									// console.log("privacy = " + privacy);
									
									if (lastdata.d1._id != dj.mongo_id)
									{
										var objDj = JSON.parse(JSON.stringify(dj));
										var objDiDj = {d1: lastdata.d1, d2: objDj, d1_vdata : diData};
										elasticConnector.getTermVectors(dj.mongo_id, privacy, objDiDj, function(resultTermsdj, originaldocs){										
											var djData = resultTermsdj.data;
											var d1Data = originaldocs.d1_vdata;
											
											var found2 = false;								
											if (djData.found == true )
											{
												found2 = true;
											}							
											
											if ( found2 )
											{
												// console.log("==========================================");
												// console.log("term vector of document i");
												// console.log("..........................................");
												// console.log(d1Data);
												// console.log("------------------------------------------");	
												// console.log("term vector of document j");
												// console.log("..........................................");
												// console.log(djData);
												// console.log("==========================================");	
												
												var vectors = Utility.buildVectors2Doc(d1Data.term_vectors, djData.term_vectors);
												// console.log("vectors to compare");
												// console.log("=======================");
												// console.log(vectors);
												// console.log("=======================");
												
												var Dij = comparer.consineSimilarity(vectors.d1, vectors.d2); // compare algorithm					
												// console.log("Similarity");
												// console.log("=======================");
												// console.log("current diff = " + Dij);											
												// console.log("=======================");		
												
												diffResults.push({d1 : originaldocs.d1, d2 : originaldocs.d2,  diff: Dij});
											}
											return series(itemsFindMax.shift());											
										},
										function(err, lastdata){
											console.log("Error happened");
											console.log(err);											
											return series(itemsFindMax.shift());											
										});
									}
									else
									{
										console.log("same item happened");
										// if item i and item j is the same, count that the item i is evaluated and rejected.									
										return series(itemsFindMax.shift());
									}
									// console.log("==========================================");								
								}
								else
								{									
									console.log("find Max");
									return finalFindMax();
								}								  
							}
							series(itemsFindMax.shift());
						}
						else
						{							
							console.log("no item happened");
							
							process.nextTick(function() {
								stillProcessing -=  1;	
													
								console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
								console.log("document id = " + lastdata.d1._id);	
								
								if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
									finalLookupSimilar();
								}
							});	
						}
					}
					else
					{					
						console.log("no term vector happened");
		
						process.nextTick(function() {
							stillProcessing -=  1;	
													
							console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
							console.log("document id = " + lastdata.d1._id);	
							if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
								finalLookupSimilar();
							}
						});	
					}					
				}, 
				function(err, lastdata){					
					console.log(err);
					// res.json('{"result":"Failed"}');		
					console.log("term vector error happened");					
					
					process.nextTick(function() {
						stillProcessing -=  1;	
						
						console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
						console.log("document id = " + lastdata.d1._id);	
						if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
							finalLookupSimilar();
						}						
					});	
				});
				
				// console.log("==========================================");
	
			});

		});
	});
	
});

recommender.post('/topicTopN', Utility.ensureAuthorized,function(req,res){
	//console.log("Recommend Top N");
	//console.log(req.body);
	res.json('{"result":"Success"}');
});

recommender.post('/socialTopNOld', Utility.ensureAuthorized,function(req,res){
//recommender.post('/socialTopN', function(req,res){
	//console.log("Social Recommend Top N");
	console.log(req.body);
	var u 		= req.body.user_id; 	// User u
	var thres 	= req.body.threshold; 	// Threshold δ, 
	var K 		= req.body.K_value; 	// number of Recommendations K
	var recommends = [];				// Result: Top-K of Recommendation items set R
	
	// FOR TESTING ALGORITHM
	// u = '57bebede4ce7748824a36846';
	// thres = 0.1;
	// K = 10;
	// Get all document rates by u.
	var ratingDocs 	= [];
	var candidate  	= {};
	var commander  	= new Neo4JCommander();
	var R 			= [];
	var L			= [];
	var l 			= [];
	var timeOut = setTimeout(function() {
		if ( L.length == 0 )
		{
			// console.log("Before");
			// console.log("=============");
			// console.log(R)
			// console.log("=============");
			// sort R base on Dij i.e. Rank(R) based on 4ij;
			R.sort(function(a, b) {
				return ( ( a.sim > b.sim ) ? -1 : (( a.sim < b.sim ) ? 1 : 0) );
			});
			// console.log("After");
			// console.log("=============");
			// console.log(R)
			// console.log("=============");
			// return top-K element from R to recommends i.e. Recommend(Top-K of R)
			if ( R.length <= K )
			{
				for (var idx = 0; idx < R.length; idx++)
				{
					recommends.push(R[idx]);
				}
			}
			else
			{
				// extract top-K elements
				for (var idx = 0; idx < K; idx++)
				{
					recommends.push(R[idx]);
				}
			}
						
			// console.log(recommends);						
			console.timeEnd("socialTopN");
			
			res.json({
				type: true,
				data: recommends
			});
		}
		else{
			res.json({
				type: false,
				data: []
			});
		}
	}, 1000);
	
	console.time("socialTopN");
	
	commander.getAllRatingsDocument(u, function(listRatings){
		
		ratingDocs = listRatings;
		// console.log("Result of the user, relationship and documents ");
		// console.log("==========================================");
		// console.log(listRatings);
		// console.log("==========================================");
		commander.getAllPublicDocumentsOfFriends(u, function(friendDocs){
			
			var elasticConnector = new Elastic(); // prepair elastic search connector to get document term vectors
			
			// L ← all public documents of user's friend			
			L = [];
			for (var h = 0; h < friendDocs.data.length; h++ )
			{
				L.push(friendDocs.data[h][4]);
			}
			// console.log("List of all documents from my friends");
			// console.log("==========================================");
			// console.log(L);
			// console.log("==========================================");
			// l ← list document rated by u; 
			l = [];
			for (var k = 0; k < ratingDocs.data.length; k++ )
			{
				l.push(ratingDocs.data[k][2]);
			}
			// console.log("List of documents user rated");
			// console.log("==========================================");
			// console.log(l);
			// console.log("==========================================");
			
			var di  = null;
			var dj  = null;
			while (L.length > 0) // for i = 1 to |L| do
			{
				var max = 0;
				// L ← L - di;		
				di = L.pop();
				// console.log("==========================================");
				// console.log(di);
				// console.log(L);
				// console.log("==========================================");
				var diprivacy = "public";
				if ( di.privacy != null )
				{
					diprivacy = di.privacy;
				}
				
				// console.log("document i");
				// console.log("==========================================");
				// console.log(di);
				// console.log("------------------------------------------");
								
				elasticConnector.getTermVectors(di.mongo_id,diprivacy, function(resultTermsdi){
					// console.log("term vector of document i");
					// console.log("==========================================");
					// console.log(resultTermsdi);
					// console.log("==========================================");
					var diData = resultTermsdi.data;
					
					var found = false;
					if (diData.found == true )
					{
						found = true;
					}
					
					if ( found ){
						
						for (var j = 0; j < l.length; j++)
						{
							dj = l[j];
							// console.log("document j");
							// console.log("==========================================");
							// console.log(dj.mongo_id);
							// console.log("==========================================");
							var privacy = "public";
							if ( dj.privacy != null )
							{
								privacy = dj.privacy;
							}
							
							// console.log("privacy = " + privacy);
							
							if (di.mongo_id != dj.mongo_id)
							{
								elasticConnector.getTermVectors(dj.mongo_id, privacy, function(resultTermsdj){	
									// console.log("term vector of document j");
									// console.log("==========================================");
									// console.log(resultTermsdj);
									// console.log("==========================================");	
									var djData = resultTermsdj.data;
									var found2 = false;								
									if (djData.found == true )
									{
										found2 = true;
									}							
									
									if ( found2 )
									{
										var vectors = Utility.buildVectors2Doc(diData.term_vectors, djData.term_vectors);
										// console.log("vectors to compare");
										// console.log("=======================");
										// console.log(vectors);
										// console.log("=======================");
										
										var Dij = comparer.consineSimilarity(vectors.d1, vectors.d2); // compare algorithm					
										// console.log("Similarity");
										// console.log("=======================");
										// console.log(Dij);
										// console.log("=======================");
										
										
										if ( max < Dij )
										{
											max = Dij; // find the most similarity
										}
										
										if ( j >= l.length && max > thres )
										{
											candidate = {};
											candidate.doc = di.mongo_id;
											candidate.sim = max;
											R.push(candidate);
										}					
									}
								},
								function(err){
									console.log(err);
									//res.json('{"result":"Failed"}');
								});
							}
							// console.log("==========================================");
						}
						
					}
				}, 
				function(err){					
					console.log(err);
					// res.json('{"result":"Failed"}');
				});
				
				// console.log("==========================================");							
				
			}			

		});
	});

});

recommender.post('/socialTopN', function(req,res){
	//console.log("Recommend Top N");
	console.log(req.body);
	var u 		= req.body.user_id; 	// User u
	var thres 	= req.body.threshold; 	// Threshold δ, 
	var K 		= req.body.K_value; 	// number of Recommendations K
	var recommends = [];				// Result: Top-K of Recommendation items set R
	
	// FOR TESTING ALGORITHM
	// u = '57bebede4ce7748824a36846';
	// thres = 0.1;
	// K = 10;
	// Get all document rates by u.
	var ratingDocs 	= [];
	var commander  	= new Neo4JCommander();
	var R 			= [];
	var L			= [];
	var l 			= [];
	
	console.time("socialTopN");
	
	commander.getAllRatingsDocument(u, function(listRatings){
		
		ratingDocs = listRatings;
		// console.log("Result of the user, relationship and documents ");
		// console.log("==========================================");
		// console.log(listRatings);
		// console.log("==========================================");
		// l ← list document rated by u; 
		l = [];
		for (var k = 0; k < ratingDocs.data.length; k++ )
		{
			l.push(ratingDocs.data[k][2]);
		}
		// console.log("List of documents user rated");
		// console.log("==========================================");
		// console.log(l);
		// console.log("==========================================");
		
		commander.getAllPublicDocumentsOfFriends(u, function(friendDocs){
			
			var elasticConnector = new Elastic(); // prepair elastic search connector to get document term vectors
					
			// L ← all public documents of user's friend			
			L = [];
			for (var h = 0; h < friendDocs.data.length; h++ )
			{
				L.push(friendDocs.data[h][4]);
			}
			console.log("List of all documents inside the system");
			console.log("==========================================");
			console.log(L);
			console.log("==========================================");
			
			var di  = null;
			var dj  = null;
			console.log("start processing");
			
			var similarResults = [];
			var timeOut = setTimeout(finalLookupSimilar, 5000);
			// for i = 1 to |L| do
			function finalLookupSimilar() { 
				//console.log('finalLookupSimilar() Done', similarResults); 
				clearTimeout(timeOut);
				//console.log("Start to collect result");			
				if ( similarResults.length > 0 )
				{
					var candidate = null;
					for (var h = 0; h < similarResults.length; h ++)
					{
						candidate = similarResults[h];
						if ( candidate.diff > 0 && candidate.d1 != null && candidate.d2 != null && candidate.diff > thres )
						{
							R.push({doc: candidate.d1, sim: candidate.diff});
						}
					}
					// console.log("working to collect result");				
	
					console.log("Before");
					// console.log("=============");
					console.log(R)
					// console.log("=============");
					//sort R base on Dij i.e. Rank(R) based on 4ij;
					R.sort(function(a, b) {
						return ( ( a.sim > b.sim ) ? -1 : (( a.sim < b.sim ) ? 1 : 0) );
					});
					console.log("After");
					// console.log("=============");
					console.log(R)
					// console.log("=============");
					// return top-K element from R to recommends i.e. Recommend(Top-K of R)
					
					// return the document list as a complement part
					var ids = [];
					
					if ( R.length <= K )
					{
						for (var idx = 0; idx < R.length; idx++)
						{
							//console.log(R[idx]);
							recommends.push(R[idx]);
							ids.push(R[idx].doc.mongo_id);
						}
					}
					else
					{
						// extract top-K elements
						for (var idx = 0; idx < K; idx++)
						{
							//console.log(R[idx]);
							recommends.push(R[idx]);
							ids.push(R[idx].doc.mongo_id);
						}
					}
					
					// console.log(recommends);
					console.timeEnd("socialTopN");
					//console.log(ids);
					var returnData = [];
					Document.find({
						'_id': { $in: ids },
						isDeleted: false
							}, null, null,function(err, fullDocs){
						if (err)
						{
							//console.log("Error in retreiving docs: " + err);
							res.json({
								type: false,
								data: "Error occured: "  + err
							});	
						}
						else{
							if ( fullDocs )
							{
								for (var jk = 0; jk < recommends.length; jk++)
								{
									for (var ik = 0; ik < fullDocs.length; ik++)
									{
									
										if ( fullDocs[ik]._id == recommends[jk].doc.mongo_id )
										{
											var data = {};
											data.doc = fullDocs[ik];
											data.sim = recommends[jk].sim;
											returnData.push(data);
										}
									}
								}
								
								res.json({
									type: true,
									data: returnData
								});
							}
							else
							{
								res.json({
									type: true,
									data: []
								});
							}
						}
					});
				}
				else{
					res.json({
						type: true,
						data: []
					});
				}
			}
			
			var proceedItems;
			proceedItems = 0;
			// L ← L - di;	
			var stillProcessing;
			stillProcessing = 0;
			var itemsLookupSimilar = L;
			itemsLookupSimilar.forEach(function(itemSim) 
			{
				di = itemSim;
				proceedItems += 1;
				stillProcessing +=  1;					
				
				// console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);	
				// console.log("document id = " + di._id);	
				// console.log("============== take di from L ============");
				// console.log(di);
				// console.log("------------------------------------------");
				// console.log(L);
				// console.log("==========================================");
			
				var diprivacy = "public";
				if ( di.privacy != null )
				{
					diprivacy = di.privacy;
				}
				
				// console.log("document i");
				// console.log("==========================================");
				// console.log(di);
				// console.log("------------------------------------------");

				var objDi = JSON.parse(JSON.stringify(di));
				var objData = {d1: objDi};
				elasticConnector.getTermVectors(di.mongo_id, diprivacy, objData, function(resultTermsdi, lastdata){
					var diData = resultTermsdi.data;
					
					var found = false;
					if (diData.found == true )
					{
						found = true;
					}
					
					if ( found )
					{
						// console.log("term vector of document i");
						// console.log("==========================================");
						// console.log(resultTermsdi);
						// console.log("==========================================");			
						// console.log(lastdata);						
						// console.log("==========================================");	
						// for j = 1 to |l| do
						
						var diffResults = [];						
						function finalFindMax() 
						{ 
							// console.log('finalFindMax() got result', diffResults); 
							
							var max = 0;
							var result = null;
							var res = null;
							for (var i = 0; i < diffResults.length; i++)
							{
								res = diffResults[i];
								if ( res.diff > max )
								{
									max = res.diff;
									result = res;
								}
							}
							
							if ( result != null )
							{
								similarResults.push(result);											
							}							
							
							//console.log('similar results now',similarResults);				

							process.nextTick(function() {
								stillProcessing -=  1;	
								console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
								console.log("document id = " + lastdata.d1.mongo_id);												
								if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
									finalLookupSimilar();
								}
							});	
						}
						
						var itemsFindMax = l;
						if ( itemsFindMax.length > 0 )
						{
							function series(itemFindMax) {
								if(itemFindMax) 
								{
									dj = itemFindMax;
									// console.log("get a document j from l");
									// console.log("==========================================");
									// console.log(dj);
									// console.log("==========================================");

									var privacy = "public";
									if ( dj.privacy != null )
									{
										privacy = dj.privacy;
									}
									
									// console.log("privacy = " + privacy);
									
									if (lastdata.d1.mongo_id != dj.mongo_id)
									{
										var objDj = JSON.parse(JSON.stringify(dj));
										var objDiDj = {d1: lastdata.d1, d2: objDj, d1_vdata : diData};
										elasticConnector.getTermVectors(dj.mongo_id, privacy, objDiDj, function(resultTermsdj, originaldocs){										
											var djData = resultTermsdj.data;
											var d1Data = originaldocs.d1_vdata;
											
											var found2 = false;								
											if (djData.found == true )
											{
												found2 = true;
											}							
											
											if ( found2 )
											{
												// console.log("==========================================");
												// console.log("term vector of document i");
												// console.log("..........................................");
												// console.log(d1Data);
												// console.log("------------------------------------------");	
												// console.log("term vector of document j");
												// console.log("..........................................");
												// console.log(djData);
												// console.log("==========================================");	
												
												var vectors = Utility.buildVectors2Doc(d1Data.term_vectors, djData.term_vectors);
												// console.log("vectors to compare");
												// console.log("=======================");
												// console.log(vectors);
												// console.log("=======================");
												
												var Dij = comparer.consineSimilarity(vectors.d1, vectors.d2); // compare algorithm					
												// console.log("Similarity");
												// console.log("=======================");
												// console.log("current diff = " + Dij);											
												// console.log("=======================");		
												
												diffResults.push({d1 : originaldocs.d1, d2 : originaldocs.d2,  diff: Dij});
											}
											return series(itemsFindMax.shift());											
										},
										function(err, lastdata){
											console.log("Error happened");
											console.log(err);											
											return series(itemsFindMax.shift());											
										});
									}
									else
									{										
										console.log("same item happened");										
										// if item i and item j is the same, count that the item i is evaluated and rejected.									
										return series(itemsFindMax.shift());
									}
									// console.log("==========================================");								
								}
								else
								{			
									console.log("find Max");
									return finalFindMax();
								}								  
							}
							series(itemsFindMax.shift());
						}
						else
						{							
							console.log("no item happened");
							
							process.nextTick(function() {
								stillProcessing -=  1;	
														
								console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
								console.log("document id = " + lastdata.d1.mongo_id);	
								
								if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {									
									finalLookupSimilar();
								}
							});	
						}
					}
					else
					{					
						console.log("no term vector happened");
		
						process.nextTick(function() {
							stillProcessing -=  1;	
						
							console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
							console.log("document id = " + lastdata.d1.mongo_id);	
							if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
								finalLookupSimilar();
							}
						});							
					}					
				}, 
				function(err, lastdata){					
					console.log(err);
					console.log("term vector error happened");

					// res.json('{"result":"Failed"}');						
					process.nextTick(function() {
						stillProcessing -=  1;	
					
						console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
						console.log("document id = " + lastdata.d1.mongo_id);	
						if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
							finalLookupSimilar();
						}						
					});							
				});
				
				// console.log("==========================================");
	
			});

		});
	});
	
});

recommender.post('/socialTopicTopN', Utility.ensureAuthorized,function(req,res){
	//console.log("Recommend Top N");
	//console.log(req.body);
	res.json('{"result":"Success"}');
});
/////////////////////// RECOMMENDATION ALGORITHM IMPLEMENTATION PART //////////////////////////////////////////
recommender.post('/simpleTopNDebug', function(req,res){
	//console.log("Recommend Top N");
	console.log(req.body);
	var u 		= req.body.user_id; 	// User u
	var thres 	= req.body.threshold; 	// Threshold δ, 
	var K 		= req.body.K_value; 	// number of Recommendations K
	var recommends = [];				// Result: Top-K of Recommendation items set R
	
	// FOR TESTING ALGORITHM
	// u = '57bebede4ce7748824a36846';
	// thres = 0.1;
	// K = 10;
	// Get all document rates by u.
	var ratingDocs 	= [];
	var commander  	= new Neo4JCommander();
	var R 			= [];
	var L			= [];
	var l 			= [];
	
	console.time("simpleTopN");
	
	commander.getAllRatingsDocument(u, function(listRatings){
		
		ratingDocs = listRatings;
		// console.log("Result of the user, relationship and documents ");
		// console.log("==========================================");
		// console.log(listRatings);
		// console.log("==========================================");
		// l ← list document rated by u; 
		l = [];
		for (var k = 0; k < ratingDocs.data.length; k++ )
		{
			l.push(ratingDocs.data[k][2]);
		}
		
		// DEBUG
		l = [];
		l.push({mongo_id : '57c0f436ce2ed398217eb87c', privacy : 'public'});
		l.push({mongo_id : '57c0f5b0ce2ed398217eb87e', privacy : 'public'});
		l.push({mongo_id : '57c0fabbce2ed398217eb880', privacy : 'public'});
		
		// console.log("List of documents user rated");
		// console.log("==========================================");
		// console.log(l);
		// console.log("==========================================");
		
		Document.find({isDeleted: false},{isDeleted:1, privacy:1}, null, function(err, docs){
			
			var elasticConnector = new Elastic(); // prepair elastic search connector to get document term vectors
					
			L = docs; // L ← all documents;
			// console.log("List of all documents inside the system");
			// console.log("==========================================");
			// console.log(L);
			// console.log("==========================================");
			// DEBUG
			L = [];
			L.push({_id : '57c0f436ce2ed398217eb87c', privacy : 'public'});
			L.push({_id : '57c0fd53ce2ed398217eb884', privacy : 'public'});
			L.push({_id : '57c0e043ce2ed398217eb874', privacy : 'public'});
			L.push({_id : '57c0e31ace2ed398217eb876', privacy : 'public'});
			
			var di  = null;
			var dj  = null;
			console.log("start processing");
			
			var similarResults = [];
			//var timeOut = setTimeout(finalLookupSimilar, 1000);
			// for i = 1 to |L| do
			function finalLookupSimilar() { 
				//console.log('finalLookupSimilar() Done', similarResults); 
				// clearTimeout(timeOut);
				//console.log("Start to collect result");			
				if ( similarResults.length > 0 )
				{
					var candidate = null;
					for (var h = 0; h < similarResults.length; h ++)
					{
						candidate = similarResults[h];
						if ( candidate.diff > 0 && candidate.d1 != null && candidate.d2 != null && candidate.diff > thres )
						{
							R.push({doc: candidate.d1, sim: candidate.diff});
						}
					}
					// console.log("working to collect result");				
	
					console.log("Before");
					// console.log("=============");
					console.log(R)
					// console.log("=============");
					//sort R base on Dij i.e. Rank(R) based on 4ij;
					R.sort(function(a, b) {
						return ( ( a.sim > b.sim ) ? -1 : (( a.sim < b.sim ) ? 1 : 0) );
					});
					console.log("After");
					// console.log("=============");
					console.log(R)
					// console.log("=============");
					// return top-K element from R to recommends i.e. Recommend(Top-K of R)
					
					// return the document list as a complement part
					var ids = [];
					
					if ( R.length <= K )
					{
						for (var idx = 0; idx < R.length; idx++)
						{
							//console.log(R[idx]);
							recommends.push(R[idx]);
							ids.push(R[idx].doc._id);
						}
					}
					else
					{
						// extract top-K elements
						for (var idx = 0; idx < K; idx++)
						{
							//console.log(R[idx]);
							recommends.push(R[idx]);
							ids.push(R[idx].doc._id);
						}
					}
					
					// console.log(recommends);
					console.timeEnd("simpleTopN");
					//console.log(ids);
					var returnData = [];
					Document.find({
						'_id': { $in: ids },
						isDeleted: false
							}, null, null,function(err, fullDocs){
						if (err)
						{
							//console.log("Error in retreiving docs: " + err);
							res.json({
								type: false,
								data: "Error occured: "  + err
							});	
						}
						else{
							if ( fullDocs )
							{
								for (var jk = 0; jk < recommends.length; jk++)
								{
									for (var ik = 0; ik < fullDocs.length; ik++)
									{
									
										if ( fullDocs[ik]._id == recommends[jk].doc._id )
										{
											var data = {};
											data.doc = fullDocs[ik];
											data.sim = recommends[jk].sim;
											returnData.push(data);
										}
									}
								}
								
								res.json({
									type: true,
									data: returnData
								});
							}
							else
							{
								res.json({
									type: true,
									data: []
								});
							}
						}
					});
				}
				else{
					res.json({
						type: true,
						data: []
					});
				}
			}
			
			var proceedItems;
			proceedItems = 0;
			// L ← L - di;	
			var stillProcessing;
			stillProcessing = 0;
			var itemsLookupSimilar = L;
			itemsLookupSimilar.forEach(function(itemSim) 
			{
				if (itemSim == null ) return;
				di = itemSim;
				proceedItems += 1;
				stillProcessing +=  1;		
				
				console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);	
				// console.log("document id = " + di._id);	
				// console.log("============== take di from L ============");
				// console.log(di);
				// console.log("------------------------------------------");
				// console.log(L);
				// console.log("==========================================");
			
				if ( di.privacy == 'undefined' )
				{
					di.privacy = 'public';
				}
				
				// console.log("document i");
				// console.log("==========================================");
				// console.log(di);
				// console.log("------------------------------------------");

				var objDi = JSON.parse(JSON.stringify(di));
				var objData = {d1: objDi};
				elasticConnector.getTermVectors(di._id, di.privacy, objData, function(resultTermsdi, lastdata){
					var diData = resultTermsdi.data;
					
					var found = false;
					if (diData.found == true )
					{
						found = true;
					}
					
					if ( found )
					{
						// console.log("term vector of document i");
						// console.log("==========================================");
						// console.log(resultTermsdi);
						// console.log("==========================================");			
						// console.log(lastdata);						
						// console.log("==========================================");	
						// for j = 1 to |l| do
						
						var diffResults = [];						
						function finalFindMax() 
						{ 
							// console.log('finalFindMax() got result', diffResults); 
							
							var max = 0;
							var result = null;
							var res = null;
							for (var i = 0; i < diffResults.length; i++)
							{
								res = diffResults[i];
								if ( res.diff > max )
								{
									max = res.diff;
									result = res;
								}
							}
							
							if ( result != null )
							{
								similarResults.push(result);											
							}							
							
							//console.log('similar results now',similarResults);				
							console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
							console.log("document id = " + lastdata.d1._id);
							process.nextTick(function() {
								stillProcessing -=  1;															
													
								if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
									finalLookupSimilar();
								}		
							});							
						}
						
						var itemsFindMax = l;
						if ( itemsFindMax.length > 0 )
						{
							function series(itemFindMax) {
								if(itemFindMax) 
								{
									dj = itemFindMax;
									// console.log("get a document j from l");
									// console.log("==========================================");
									// console.log(dj);
									// console.log("==========================================");

									var privacy = "public";
									if ( dj.privacy != null )
									{
										privacy = dj.privacy;
									}
									
									// console.log("privacy = " + privacy);
									
									if (lastdata.d1._id != dj.mongo_id)
									{
										var objDj = JSON.parse(JSON.stringify(dj));
										var objDiDj = {d1: lastdata.d1, d2: objDj, d1_vdata : diData};
										elasticConnector.getTermVectors(dj.mongo_id, privacy, objDiDj, function(resultTermsdj, originaldocs){										
											var djData = resultTermsdj.data;
											var d1Data = originaldocs.d1_vdata;
											
											var found2 = false;								
											if (djData.found == true )
											{
												found2 = true;
											}							
											
											if ( found2 )
											{
												// console.log("==========================================");
												// console.log("term vector of document i");
												// console.log("..........................................");
												// console.log(d1Data);
												// console.log("------------------------------------------");	
												// console.log("term vector of document j");
												// console.log("..........................................");
												// console.log(djData);
												// console.log("==========================================");	
												
												var vectors = Utility.buildVectors2Doc(d1Data.term_vectors, djData.term_vectors);
												// console.log("vectors to compare");
												// console.log("=======================");
												// console.log(vectors);
												// console.log("=======================");
												
												var Dij = comparer.consineSimilarity(vectors.d1, vectors.d2); // compare algorithm					
												// console.log("Similarity");
												// console.log("=======================");
												// console.log("current diff = " + Dij);											
												// console.log("=======================");		
												
												diffResults.push({d1 : originaldocs.d1, d2 : originaldocs.d2,  diff: Dij});
											}
											return series(itemsFindMax.shift());											
										},
										function(err, lastdata){
											console.log("Error happened");
											console.log(err);											
											return series(itemsFindMax.shift());											
										});
									}
									else
									{
										console.log("same item happened");
										// if item i and item j is the same, count that the item i is evaluated and rejected.									
										return series(itemsFindMax.shift());
									}
									// console.log("==========================================");								
								}
								else
								{						
									console.log("find Max");
									return finalFindMax();
								}								  
							}
							series(itemsFindMax.shift());
						}
						else
						{							
							console.log("no item happened");
							
							process.nextTick(function() {
								stillProcessing -=  1;	
								console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
								console.log("document id = " + lastdata.d1._id);	
								
								if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
									finalLookupSimilar();
								}
							});														
						}
					}
					else
					{					
						console.log("no term vector happened");
		
						process.nextTick(function() {
							stillProcessing -=  1;	
							console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
							console.log("document id = " + lastdata.d1._id);	
							if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
								finalLookupSimilar();
							}
						});							
						
					}					
				}, 
				function(err, lastdata){					
					console.log(err);
					// res.json('{"result":"Failed"}');			
					console.log("term vector error happened");					
					
					process.nextTick(function() {
						stillProcessing -=  1;	
						console.log("proceed Items results = " + proceedItems + " and items = " + itemsLookupSimilar.length + " - item processing = " + stillProcessing);
						console.log("document id = " + lastdata.d1._id);	
						if(proceedItems == itemsLookupSimilar.length && stillProcessing <= 0) {
							finalLookupSimilar();
						}					
					});				
				});
				
				// console.log("==========================================");
	
			});

		});
	});
	
});

module.exports = recommender;