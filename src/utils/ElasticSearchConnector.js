//var extract     = require('textract');
var http		= require('http');
var path		= require('path');
var tika        = require('tika');

var config		= require('../config/config');

function ElasticSearchConnnector() {

}

var elastic = ElasticSearchConnnector.prototype;


elastic.cloneUserIndexingData = function(user) 
{
	var indexingData = {};
	indexingData.id			= user._id;
	indexingData.username 	= user.username;
	indexingData.email 		= user.email;
	return indexingData;
}

elastic.cloneDocumentIndexingData = function(doc, pages) 
{
	var indexingData = {};
	indexingData.id			   = doc._id;
	indexingData.authors	   = doc.authors;
	indexingData.content 	   = pages;	
	indexingData.fileName 	   = doc.fileName;
	indexingData.title		   = doc.title;
	indexingData.uploadedDate  = doc.uploadedDate;
	indexingData.uploadedUser  = doc.uploadedUser;
	indexingData.uploadedPath  = doc.uploadedPath;
	indexingData.abstract  	   = doc.abstract;
	indexingData.keywords  	   = doc.keywords;
	indexingData.publisher	   = doc.publisher;
	indexingData.publishedDate = doc.publishedDate;					
	indexingData.category 	   = doc.category;					
	return indexingData;
}

elastic.cloneDocumentUpdatedData = function(doc) 
{
	var indexingData = {};
	indexingData.authors	   = doc.authors;
	indexingData.title		   = doc.title;
	indexingData.abstract  	   = doc.abstract;
	indexingData.keywords  	   = doc.keywords;
	indexingData.publisher	   = doc.publisher;
	indexingData.publishedDate = doc.publishedDate;
	indexingData.category 	   = doc.category;			
	return indexingData;
}

elastic.generateOptions = function(object, datalength, userid, privacy, mode)
{
	var options = {};
	console.log("datalength: " + datalength);
	console.log("privacy: " + privacy);
	console.log("mode: " 	+ mode);
	console.log("userid: " 	+ userid);
	if ( mode === '1' ) // Custom routing with 3 public/private/share indexes
	{
		options = {
			host: config.searchengine.HOST,
			port: config.searchengine.PORT,
			path: '/doclib_' + privacy + '/Document/' + object.id + '/_create?routing=' + userid,
			method: 'POST',
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Content-Length': datalength
		}};
		console.log("Custom routing with 3 public/private/share indexes");		
	}
	if ( mode === '2' ) // Custom routing with one index and 3 public/private/share types
	{
		options = {
			host: config.searchengine.HOST,
			port: config.searchengine.PORT,
			path: '/doclib2/Document_' + privacy + '/' + object.id + '/_create?routing=' + userid,
			method: 'POST',
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Content-Length': datalength
		}};
		console.log("Custom routing with one index and 3 public/private/share types");		
	}
	else if ( mode === '3' ) // Separate indexes for users
	{
		options = {
			host: config.searchengine.HOST,
			port: config.searchengine.PORT,
			path: '/doclib3_' + userid + '_' + privacy + '/Document/' + object.id + '/_create',
			method: 'POST',
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Content-Length': datalength
		}};
		console.log("Run in Separate indexes mode");
	}
	else if ( mode === '4' ) // Separate types for private/public/share
	{
		options = {
			host: config.searchengine.HOST,
			port: config.searchengine.PORT,
			path: '/doclib4_' + userid + '/Document_' + privacy + '/' + object.id + '/_create',
			method: 'POST',
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Content-Length': datalength
		}};
		console.log("Run in Separate types for private/public/share mode");
	}
	else{
		console.log("The Mode is out of service");
	}
	console.log('=============OPTIONS===============');
	console.log(options);
	console.log('===================================');
	return options;
}


elastic.uploadDocument = function(doc, mode, userid, successCallback, errorCallback){
	
	// Extract text from the PDF file, then push it into search engine storage
	var absolutePath = path.join(__dirname + '/../', doc.uploadedPath);
	console.log("absolute Path = " + absolutePath);
	// extract.fromFileWithPath(absolutePath, function (err, pages) {   // -- Comment out because change library from textract to tika, it supports a huge number of document types.
/* 	tika.type(absolutePath, function(err, contentType) {
		console.log(contentType); // Logs 'application/pdf'.
		var options = {
			contentType: contentType
		}; */
		
		tika.text(absolutePath, function (err, pages) {  
			if (err) { 
				console.log("Error with extract module");
				console.dir(err) 
				return 
			}		
			//console.dir(pages);
			var cloneObject = elastic.cloneDocumentIndexingData(doc, pages);
			//console.log(cloneObject);
			var data = JSON.stringify(cloneObject);
			//console.log(data);
			var options = elastic.generateOptions(cloneObject, Buffer.byteLength(data), userid, doc.privacy, mode);
			
			console.log(options);
			var httpreq = http.request(options, function (response) {
				response.setEncoding('utf8');
				response.on('data', function (chunk) {
					console.log("body: " + chunk);
				});
				response.on('end', function() {
					console.log("response code:" + response.statusCode);
					if ( response.statusCode == 201 )
					{
						if (typeof successCallback === "function") {						
							successCallback(response.statusCode);
						}
					}
					else{
						if (typeof errorCallback === "function") {						
							errorCallback(response.statusCode);
						}
					}
				})
			});
			httpreq.write(data);
			httpreq.end();	   
		});
	/* }); */
}

elastic.updateDocument = function(doc, userid, successCallback, errorCallback){
	// Support for selected strategy only - demomode = 1
	
	var cloneObject = elastic.cloneDocumentUpdatedData(doc);
	//console.log(cloneObject);
	var data = '{ "doc" : ' + JSON.stringify(cloneObject) + ' }';
	//console.log(data);
	var options = {
			host: config.searchengine.HOST,
			port: config.searchengine.PORT,
			path: '/doclib_' + doc.privacy + '/Document/' + doc._id + '/_update?routing=' + userid,
			method: 'POST',
			headers: {
			  'Content-Length': data.length
		}};
	console.log("==========Update Document =========");
	console.log(options);

	var httpreq = http.request(options, function (response) {
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log("body: " + chunk);
		});
		response.on('end', function() {
			console.log("response code:" + response.statusCode);
			if ( response.statusCode == 200 )
			{
				if (typeof successCallback === "function") {						
					successCallback(response.statusCode);
				}
			}
			else{
				if (typeof errorCallback === "function") {						
					errorCallback(response.statusCode);
				}
			}
		})
	});
	httpreq.write(data);
	httpreq.end();
}

elastic.deleteDocument = function(privacy, document_id, userid, successCallback, errorCallback){
	// Support for selected strategy only - demomode = 1
	var options = {
		host: config.searchengine.HOST,
		port: config.searchengine.PORT,
		path: '/doclib_'+ privacy + '/Document/' + document_id + '?routing=' + userid,
		method: 'DELETE'
	};
	console.log("==========Delete Document =========");
	console.log(options);
	var httpreq = http.request(options, function (response) {
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log("body: " + chunk);
		});
		response.on('end', function() {
			console.log("response code:" + response.statusCode);
			if ( response.statusCode == 200 )
			{
				if (typeof successCallback === "function") {						
					successCallback(response.statusCode);
				}
			}
			else{
				if (typeof errorCallback === "function") {						
					errorCallback(response.statusCode);
				}
			}
		})
	});
	// No body data
	httpreq.end();	   
}

// insert user to search engine
elastic.insertUser = function(user, successCallback, errorCallback)
{
	var cloneObject = elastic.cloneUserIndexingData(user);
	//console.log(cloneObject);
	var data = JSON.stringify(cloneObject);
	//console.log(data);
	var options = {
			host: config.searchengine.HOST,
			port: config.searchengine.PORT,
			path: '/doclib_main/User/' + cloneObject.id + '/_create',
			method: 'POST',
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Content-Length': data.length
		}};
	
	console.log(options);
	var httpreq = http.request(options, function (response) {
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log("body: " + chunk);
		});
		response.on('end', function() {
			console.log("response code:" + response.statusCode);
			if ( response.statusCode == 201 )
			{
				if (typeof successCallback === "function") {						
					successCallback(response.statusCode);
				}
			}
			else{
				if (typeof errorCallback === "function") {						
					errorCallback(response.statusCode);
				}
			}
		})
	});
	httpreq.write(data);
	httpreq.end();	   
}

// delete user from search engine
elastic.deleteUser = function(user_id, successCallback, errorCallback)
{
	var options = {
		host: config.searchengine.HOST,
		port: config.searchengine.PORT,
		path: '/doclib_main/User/' + user_id,
		method: 'DELETE'
	};
	console.log("==========Delete User =========");
	console.log(options);
	var httpreq = http.request(options, function (response) {
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log("body: " + chunk);
		});
		response.on('end', function() {
			console.log("response code:" + response.statusCode);
			if ( response.statusCode == 200 )
			{
				if (typeof successCallback === "function") {						
					successCallback(response.statusCode);
				}
			}
			else{
				if (typeof errorCallback === "function") {						
					errorCallback(response.statusCode);
				}
			}
		})
	});
	// No body data
	httpreq.end();	  
}

// http://localhost:9200/doclib_public/Document/57c0fa33ce2ed398217eb87f/_termvectors?fields=abstract,keywords,title&offsets=false&positions=false&term_statistics=true&field_statistics=true&pretty=true
// get Term Vectors of a document
elastic.getTermVectors = function(doc_id, privacy, routing_user_id, lastdata, successCallback, errorCallback)
{
	if ( privacy == 'undefined' )
	{
		privacy = 'public';
	}
	
	var options = {
		host: config.searchengine.HOST,
		port: config.searchengine.PORT,
		path: '/doclib_' + privacy + '/Document/' + doc_id + '/_termvectors?fields=abstract,keywords,title&offsets=false&positions=false&term_statistics=true&field_statistics=true&routing=' + routing_user_id,
		method: 'GET'
	};
	//console.log("==========Get Term Vectors of Documents =========");
	// console.log(options);
	//console.log("Request sent");
	var httpreq = http.request(options, function (response) {
		var body = "";
		response.setEncoding('utf8');		
		response.on('data', function (chunk) {
			//console.log("body: " + chunk);
			body += chunk;
		});
		response.on('end', function() {
			//console.log("Response received");
			//console.log("response code:" + response.statusCode);
			if ( response.statusCode == 200 )
			{
				var result = {status: response.statusCode, data: JSON.parse(body)};
				if (typeof successCallback === "function") {
					successCallback(result, lastdata);
				}
			}
			else{
				var result = {status: response.statusCode, data: ""};
				if (typeof errorCallback === "function") {
					errorCallback(result, lastdata);
				}
			}
		});
	});
	
	httpreq.on('error', function(e) { 
		//console.log("request error timeout");
		var result = {status: -1, data: ""};
		if (typeof errorCallback === "function") {
			console.log('problem with request: ' + e.message);
			errorCallback(result, lastdata);
		}
	}); 

	httpreq.setTimeout(3000); 
	// No body data
	httpreq.end();	  
}

module.exports = ElasticSearchConnnector;