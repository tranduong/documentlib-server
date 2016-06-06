var extract     = require('textract');
var http		= require('http');
var path		= require('path');
function ElasticSearchConnnector() {

}

var elastic = ElasticSearchConnnector.prototype;

elastic.cloneIndexingData = function(doc, pages) 
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
	indexingData.publisher	   = doc.publisher;
	indexingData.publishedDate = doc.publishedDate;					
	return indexingData;
}

elastic.cloneUpdatedData = function(doc) 
{
	var indexingData = {};
	indexingData.authors	   = doc.authors;
	indexingData.title		   = doc.title;
	indexingData.abstract  	   = doc.abstract;
	indexingData.publisher	   = doc.publisher;
	indexingData.publishedDate = doc.publishedDate;					
	return indexingData;
}

elastic.uploadDocument = function(doc, successCallback, errorCallback){
	
	// Extract text from the PDF file, then push it into search engine storage
	var absolutePath = path.join(__dirname, doc.uploadedPath);
	console.log("absolute Path = " + absolutePath);
	extract.fromFileWithPath(absolutePath, function (err, pages) {  
		if (err) { 
			console.dir(err) 
			return 
		}		
		//console.dir(pages);
		var cloneObject = elastic.cloneIndexingData(doc, pages);
		//console.log(cloneObject);
	    var data = JSON.stringify(cloneObject);
		//console.log(data);
		var options = {
			host: 'localhost',
			port: 9200,
			path: '/documentlib/Document/' + cloneObject.id + '/_create',
			method: 'POST',
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Content-Length': Buffer.byteLength(data)
			}
		};
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
 
}

elastic.updateDocument = function(doc, successCallback, errorCallback){
	
	var cloneObject = elastic.cloneUpdatedData(doc);
	//console.log(cloneObject);
	var data = JSON.stringify(cloneObject);
	//console.log(data);
	var options = {
		host: 'localhost',
		port: 9200,
		path: '/documentlib/Document/' + cloneObject.id + '/_update',
		method: 'POST',
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  'Content-Length': Buffer.byteLength(data)
		}
	};
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

module.exports = ElasticSearchConnnector;