'use strict';

var express = require('express');
var recommender = express.Router();
var Utils 			= require('../utils/Utils');
var Utility 		= new Utils();

//Middle ware that is specific to this router
recommender.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

/////////////////////// RECOMMENDATION ALGORITHM IMPLEMENTATION PART //////////////////////////////////////////
recommender.post('/recommendTopN', Utility.ensureAuthorized,function(req,res){
	//console.log("Recommend Top N");
	//console.log(req.body);
	res.json('{"result":"Success"}');
});

recommender.post('/simpleTopN', Utility.ensureAuthorized,function(req,res){
	//console.log("Recommend Top N");
	//console.log(req.body);
	res.json('{"result":"Success"}');
});

recommender.post('/topicTopN', Utility.ensureAuthorized,function(req,res){
	//console.log("Recommend Top N");
	//console.log(req.body);
	res.json('{"result":"Success"}');
});

recommender.post('/socialTopN', Utility.ensureAuthorized,function(req,res){
	//console.log("Recommend Top N");
	//console.log(req.body);
	res.json('{"result":"Success"}');
});

recommender.post('/socialTopicTopN', Utility.ensureAuthorized,function(req,res){
	//console.log("Recommend Top N");
	//console.log(req.body);
	res.json('{"result":"Success"}');
});
/////////////////////// RECOMMENDATION ALGORITHM IMPLEMENTATION PART //////////////////////////////////////////

module.exports = recommender;