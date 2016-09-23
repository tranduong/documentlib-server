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
	
	// map attribute from doc1 to doc2
	// title
	for(var key in doc1_termsVector.title.terms)
	{
		if(doc1_termsVector.title.terms.hasOwnProperty(key))
		{
			if(typeof doc1_vector[key] == 'undefined')
			{
				doc1_vector[key] = [];
				doc2_vector[key] = [];
			}
			doc1_vector[key].push(doc1_termsVector.title.terms[key]);
			
			if(doc2_termsVector.title.terms.hasOwnProperty(key))
			{				
				doc2_vector[key].push(doc2_termsVector.title.terms[key]);
			}
			else
			{
				var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
				doc2_vector[key].push(no_item);
			}
			
			// console.log("key: " + key + ", doc1: " + doc1_vector[key] + ", doc2: " + doc2_vector[key] + "\r\n");
		}
	}
	
	// abstract
	for(var key in doc1_termsVector.abstract.terms)
	{
		if(doc1_termsVector.abstract.terms.hasOwnProperty(key))
		{
			if(typeof doc1_vector[key] == 'undefined')
			{
				doc1_vector[key] = [];
				doc2_vector[key] = [];
			}
			doc1_vector[key].push(doc1_termsVector.abstract.terms[key]);
			
			if(doc2_termsVector.abstract.terms.hasOwnProperty(key))
			{				
				doc2_vector[key].push(doc2_termsVector.abstract.terms[key]);
			}
			else
			{
				var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
				doc2_vector[key].push(no_item);
			}
			
			// console.log("key: " + key + ", doc1: " + doc1_vector[key] + ", doc2: " + doc2_vector[key] + "\r\n");
		}
	}
	
	// keywords
	for(var key in doc1_termsVector.keywords.terms)
	{
		if(doc1_termsVector.keywords.terms.hasOwnProperty(key))
		{
			if(typeof doc1_vector[key] == 'undefined')
			{
				doc1_vector[key] = [];
				doc2_vector[key] = [];
			}
			doc1_vector[key].push(doc1_termsVector.keywords.terms[key]);
			
			if(doc2_termsVector.keywords.terms.hasOwnProperty(key))
			{				
				doc2_vector[key].push(doc2_termsVector.keywords.terms[key]);
			}
			else
			{
				var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
				doc2_vector[key].push(no_item);
			}
			
			// console.log("key: " + key + ", doc1: " + doc1_vector[key] + ", doc2: " + doc2_vector[key] + "\r\n");
		}
	}
	
	// map the remain attribute existed in doc2 but not in doc1
	// title
	for(var key in doc2_termsVector.title.terms)
	{
		if(doc1_termsVector.title.terms.hasOwnProperty(key) == false)
		{
			if(typeof doc1_vector[key] == 'undefined')
			{
				doc1_vector[key] = [];
				doc2_vector[key] = [];
				
				if(doc2_termsVector.title.terms.hasOwnProperty(key))
				{				
					doc2_vector[key].push(doc2_termsVector.title.terms[key]);
				}
				var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
				doc1_vector[key].push(no_item);
			}
			// console.log("key: " + key + ", doc1: " + doc1_vector[key] + ", doc2: " + doc2_vector[key] + "\r\n");
		}
	}
	
	// abstract
	for(var key in doc2_termsVector.abstract.terms)
	{
		if(doc1_termsVector.abstract.terms.hasOwnProperty(key) == false)
		{
			if(typeof doc1_vector[key] == 'undefined')
			{
				doc1_vector[key] = [];
				doc2_vector[key] = [];
				
				if(doc2_termsVector.abstract.terms.hasOwnProperty(key))
				{				
					doc2_vector[key].push(doc2_termsVector.abstract.terms[key]);
				}
				
				var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
				doc1_vector[key].push(no_item);
			}	
			// console.log("key: " + key + ", doc1: " + doc1_vector[key] + ", doc2: " + doc2_vector[key] + "\r\n");
		}
	}
	
	// keywords
	for(var key in doc2_termsVector.keywords.terms)
	{
		if(doc1_termsVector.keywords.terms.hasOwnProperty(key) == false)
		{
			if(typeof doc1_vector[key] == 'undefined')
			{
				doc1_vector[key] = [];
				doc2_vector[key] = [];
				if(doc2_termsVector.keywords.terms.hasOwnProperty(key))
				{				
					doc2_vector[key].push(doc2_termsVector.keywords.terms[key]);
				}			
				
				var no_item = { doc_freq: 0, ttf: 0, term_freq: 0 };
				doc1_vector[key].push(no_item);
				
			}			
			// console.log("key: " + key + ", doc1: " + doc1_vector[key] + ", doc2: " + doc2_vector[key] + "\r\n");
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