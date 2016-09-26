var config = require('../config/config');

function Utils() {

}

var utils = Utils.prototype;

utils.getTypeOfRelation = function(strAction, req, res){
	if ( strAction === "rate"){
		return config.relationship_type.USER_RATE_DOCUMENT;
	}
	else if ( strAction === "view"){
		return config.relationship_type.USER_VIEW_DOCUMENT;
	}
	else if ( strAction === "download"){
		return config.relationship_type.USER_DOWNLOAD_DOCUMENT;
	}
	else if ( strAction === "upload"){
		return config.relationship_type.USER_UPLOAD_DOCUMENT;
	}
	else if ( strAction === "like"){
		return config.relationship_type.USER_LIKE_DOCUMENT;
	}
	else if ( strAction === "comment"){
		return config.relationship_type.USER_COMMENT_DOCUMENT;
	}
	else if ( strAction === "share"){
		return config.relationship_type.USER_SHARE_DOCUMENT;
	}
	else if ( strAction === "read"){
		return config.relationship_type.USER_READ_DOCUMENT;
	}
	else if ( strAction === "unlike"){
		return config.relationship_type.USER_UNLIKE_DOCUMENT;
	}
	else if ( strAction === "stopread"){
		return config.relationship_type.USER_STOP_READ_DOCUMENT;
	}
}

utils.ensureAuthorized = function (req, res, next) {
    var bearerToken;
	// console.log("request headers : " + req.headers["authorization"]);
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

utils.buildVectors2Doc = function (doc1_termsVector, doc2_termsVector){
	var doc_vectors = {};
	// console.log("=====================");
		
	var doc1_vector = [];
	var doc2_vector = [];
	
	// console.log("build titles attributes for both");
	// map attribute from doc1 to doc2
	// title
	for(var key in doc1_termsVector["title"].terms)
	{
		if(doc1_termsVector["title"].terms.hasOwnProperty(key))
		{
			var strKey = "key_" + key;
			if(typeof doc1_vector[strKey] == 'undefined')
			{
				doc1_vector[strKey] = [];
			}
			if(typeof doc2_vector[strKey] == 'undefined')
			{
				doc2_vector[strKey] = [];
			}
			// console.log("key = " + strKey);
			// console.log("value = " + doc1_termsVector["title"].terms[key]);
			// console.log("doc vector = " + doc1_vector[strKey]);
			doc1_vector[strKey].push(doc1_termsVector["title"].terms[key]);
			if(doc2_termsVector["title"].terms.hasOwnProperty(key))
			{				
				doc2_vector[strKey].push(doc2_termsVector["title"].terms[key]);
			}
			else
			{
				var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
				doc2_vector[strKey].push(no_item);
			}
			// console.log("key: " + key + ", doc1: " + doc1_vector[strKey] + ", doc2: " + doc2_vector[strKey] + "\r\n");
		}
	}

	// console.log("build abstracts attributes for both");
	// abstract
	for(var key in doc1_termsVector["abstract"].terms)
	{
		if(doc1_termsVector["abstract"].terms.hasOwnProperty(key))
		{
			var strKey = "key_" + key;
			if(typeof doc1_vector[strKey] == 'undefined')
			{
				doc1_vector[strKey] = [];
			}
			if(typeof doc2_vector[strKey] == 'undefined')
			{
				doc2_vector[strKey] = [];
			}
			// console.log("key = " + strKey);
			// console.log("value = " + doc1_termsVector["abstract"].terms[key]);
			// console.log("doc vector = " + doc1_vector[strKey]);
			doc1_vector[strKey].push(doc1_termsVector["abstract"].terms[key]);
			if(doc2_termsVector["abstract"].terms.hasOwnProperty(key))
			{				
				doc2_vector[strKey].push(doc2_termsVector["abstract"].terms[key]);
			}
			else
			{
				var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
				doc2_vector[strKey].push(no_item);
			}
			// console.log("key: " + key + ", doc1: " + doc1_vector[strKey] + ", doc2: " + doc2_vector[strKey] + "\r\n");
		}
	}
	
	// console.log("build keywords attributes for both");
	// keywords
	for(var key in doc1_termsVector["keywords"].terms)
	{
		if(doc1_termsVector["keywords"].terms.hasOwnProperty(key))
		{
			var strKey = "key_" + key;
			if(typeof doc1_vector[strKey] == 'undefined')
			{
				doc1_vector[strKey] = [];
			}
			if(typeof doc2_vector[strKey] == 'undefined')
			{
				doc2_vector[strKey] = [];
			}
			// console.log("key = " + strKey);
			// console.log("value = " + doc1_termsVector["keywords"].terms[key]);
			// console.log("doc vector = " + doc1_vector[strKey]);
			doc1_vector[strKey].push(doc1_termsVector["keywords"].terms[key]);
			if(doc2_termsVector["keywords"].terms.hasOwnProperty(key))
			{				
				doc2_vector[strKey].push(doc2_termsVector["keywords"].terms[key]);
			}
			else
			{
				var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
				doc2_vector[strKey].push(no_item);
			}
			// console.log("key: " + key + ", doc1: " + doc1_vector[strKey] + ", doc2: " + doc2_vector[strKey] + "\r\n");
		}
	}

	// console.log("map titles attributes from doc2 to doc1");	
	// map the remain attribute existed in doc2 but not in doc1
	// title
	for(var key in doc2_termsVector["title"].terms)
	{		
		if(doc1_termsVector["title"].terms.hasOwnProperty(key) == false)
		{
			var strKey = "key_" + key;
			if(typeof doc1_vector[strKey] == 'undefined')
			{
				doc1_vector[strKey] = [];
			}
			
			if(typeof doc2_vector[strKey] == 'undefined')
			{
				doc2_vector[strKey] = [];
			}
			
			if(doc2_termsVector["title"].terms.hasOwnProperty(key))
			{				
				doc2_vector[strKey].push(doc2_termsVector["title"].terms[key]);
			}
			var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
			doc1_vector[strKey].push(no_item);
			// console.log("key: " + key + ", doc1: " + doc1_vector[strKey] + ", doc2: " + doc2_vector[strKey] + "\r\n");
		}
	}

	// console.log("map abstract attributes from doc2 to doc 1");	
	// abstract
	for(var key in doc2_termsVector["abstract"].terms)
	{		
		if(doc1_termsVector["abstract"].terms.hasOwnProperty(key) == false)
		{
			var strKey = "key_" + key;
			if(typeof doc1_vector[strKey] == 'undefined')
			{
				doc1_vector[strKey] = [];
			}
			
			if(typeof doc2_vector[strKey] == 'undefined')
			{
				doc2_vector[strKey] = [];
			}
			
			if(doc2_termsVector["abstract"].terms.hasOwnProperty(key))
			{				
				doc2_vector[strKey].push(doc2_termsVector["abstract"].terms[key]);
			}
			var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
			doc1_vector[strKey].push(no_item);
			// console.log("key: " + key + ", doc1: " + doc1_vector[strKey] + ", doc2: " + doc2_vector[strKey] + "\r\n");
		}
	}
	
	// console.log("map keywords attributes from doc2 to doc 1");	
	// keywords
	for(var key in doc2_termsVector["keywords"].terms)
	{		
		if(doc1_termsVector["keywords"].terms.hasOwnProperty(key) == false)
		{
			var strKey = "key_" + key;
			if(typeof doc1_vector[strKey] == 'undefined')
			{
				doc1_vector[strKey] = [];
			}
			
			if(typeof doc2_vector[strKey] == 'undefined')
			{
				doc2_vector[strKey] = [];
			}
			
			if(doc2_termsVector["keywords"].terms.hasOwnProperty(key))
			{				
				doc2_vector[strKey].push(doc2_termsVector["keywords"].terms[key]);
			}
			var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
			doc1_vector[strKey].push(no_item);
			// console.log("key: " + key + ", doc1: " + doc1_vector[strKey] + ", doc2: " + doc2_vector[strKey] + "\r\n");
		}
	}
	// console.log(doc1_vector);
	// console.log("=====================");
	// console.log(doc2_vector);	
	// console.log("=====================");
	doc_vectors.d1 = doc1_vector;
	doc_vectors.d2 = doc2_vector;
	// console.log(doc_vectors);	
	// console.log("=====================");
	return doc_vectors;
}

module.exports = Utils;