var neo4j  = require('node-neo4j'); 
var config = require('../config/config');

var db = new neo4j(config.graphdb.URL); 

var bDebug = false;

function Neo4JCommander() {

}

var commander = Neo4JCommander.prototype;

function getDocumentIdFromMongoID(document_mongo_id, callbackFunc){
	var query = 'MATCH (n:' + config.node_type.DOCUMENT + ') WHERE n.mongo_id = \'' + document_mongo_id + '\' RETURN n';
	db.cypherQuery(query, function (err, nodes){
		if (err)
		{
			console.log(err);
			throw err;
		}
		//console.log(nodes);
		if ( nodes.data.length > 0)
		{
			if ( callbackFunc && typeof callbackFunc === 'function')
				callbackFunc(nodes.data[0]);
		}
	});
};

function getUserIdFromMongoID(user_mongo_id, callbackFunc){
	var query = 'MATCH (n:' + config.node_type.USER + ') WHERE n.mongo_id = \'' + user_mongo_id + '\' RETURN n';
		
	db.cypherQuery(query, function(err, nodes){
		if (err)
		{
			console.log(err);
			throw err;
		}
		
		if ( nodes.data.length > 0)
		{
			console.log(nodes);
			if ( callbackFunc && typeof callbackFunc === 'function')
				callbackFunc(nodes.data[0]);
		}
		
	});
};

function getUserDocumentRelationshipFromMongoID(user_mongo_id, document_mongo_id, relationship_type, callbackFunc){
	var query = 'MATCH (u:' + config.node_type.USER + ')-[r:' + relationship_type + ']->(d:' + config.node_type.DOCUMENT + ') WHERE ' +
		'u.mongo_id = \'' + user_mongo_id + '\' AND d.mongo_id = \'' + document_mongo_id + '\' RETURN r';
	//console.log(query);
	db.cypherQuery(query, function(err, result){
		if (err)
		{
			console.log(err);
			throw err;
		}
				
		console.log(result);
		if ( callbackFunc && typeof callbackFunc === 'function')
			callbackFunc(result);
		
	});
};


commander.createDocumentNode = function(doc, callbackDone)
{	
	var id = doc._id;
	if ( bDebug ) id = doc.mongo_id;
	console.log("document_id : " + id);
	
	db.insertNode({mongo_id: id, privacy : doc.privacy}, config.node_type.DOCUMENT, function(err, node) { 
		if (err)
		{
			console.log(err);
			throw err;
		}
	   
		console.log('Document Node saved to database with id: ' + node.mongo_id); 
		
		/* db.insertLabelIndex(config.node_type.DOCUMENT, 'mongo_id' , function (err, res) { 			
			if(err) throw err;			   
			console.log('Document Node indexed with mongo_id');

			if( callbackDone !== null && typeof callbackDone === 'function') {
				callbackDone(res);
			}			
		}); */
		
		if( callbackDone !== null && typeof callbackDone === 'function') {
			callbackDone(node);
		}
	});		
}

commander.createUserNode = function(user, callbackDone)
{
	var id = user._id;
	if ( bDebug ) id = user.mongo_id;
	
	console.log("user_id : " + id);
	db.insertNode({mongo_id: id, username : user.username, avatar_img : user.avatar_img, email : user.email}, config.node_type.USER, function(err, node) { 
		if (err)
		{
			console.log(err);
			throw err;
		}
		
		console.log('User Node saved to database with id: ' + node.mongo_id); 
		
		/* db.insertLabelIndex(config.node_type.USER, 'mongo_id' ,  function (err, res) { 
			if(err) throw err;
	   
			console.log('User Node indexed with mongo_id'); 
			
			if( callbackDone !== null && typeof callbackDone === 'function') {
				callbackDone(res);
			}				
		}); */
		if( callbackDone !== null && typeof callbackDone === 'function') {
			callbackDone(node);
		}			
	});	
}

commander.createUserUserRelationship = function(from_user_id, to_user_id, type_of_relationship, data_of_relationship, callbackDone)
{
	console.log("truoc khi goi ham getUserIdFromMongoID");
	getUserIdFromMongoID(from_user_id, function(node1){	
		getUserIdFromMongoID(to_user_id, function(node2){
			//console.log(node2);
			console.log("Neo4j user id from " + from_user_id + " is " + node1._id);
			console.log("Neo4j user id from " + to_user_id + " is " + node2._id);
			console.log("Neo4j new relationship : " + node1._id + " - " + type_of_relationship + " - "  + node2._id);
			db.insertRelationship(node1._id, node2._id, type_of_relationship, data_of_relationship, function(err, relationship){
				if (err)
				{
					console.log(err);
					throw err;
				}

				// Output relationship
				console.log(relationship);

				if( callbackDone !== null && typeof callbackDone === 'function') {
					callbackDone(relationship);
				}					
			});
		});
	});
}

commander.createUserDocumentRelationship = function(from_user_id, to_document_id, type_of_relationship, data_of_relationship, callbackDone)
{
	getUserIdFromMongoID(from_user_id, function(node1){	
		//console.log(node1);
		//console.log("Neo4j user id from " + from_user_id + " is " + node1._id);

		getDocumentIdFromMongoID(to_document_id, function(node2){
			//console.log(node2);
			//console.log("Neo4j document id from " + to_document_id + " is " + node2._id);
			//console.log("Neo4j user id from " + from_user_id + " is " + node1._id);
			//console.log("Neo4j document id from " + to_document_id + " is " + node2._id);
			console.log("Neo4j new relationship : " + node1._id + " - " + type_of_relationship + " - "  + node2._id);
			db.insertRelationship(node1._id, node2._id, type_of_relationship, data_of_relationship, function(err, relationship){
				if (err)
				{
					console.log(err);
					throw err;
				}

				// Output relationship
				//console.log(relationship);
				
				if( callbackDone !== null && typeof callbackDone === 'function') {
					callbackDone(relationship);
				}				
			});
					
		});

	});
}

commander.deleteUserDocumentRelationship = function(from_user_id, to_document_id, type_of_relationship, callbackDone)
{
	getUserDocumentRelationshipFromMongoID(from_user_id,to_document_id, type_of_relationship, function(result){	
		console.log("Neo4j delete relationship : "+ JSON.stringify(result));
		if (typeof result.data !== 'undefined' && result.data.length > 0){
			//console.log(result.data);
			var relationship_id = result.data[0]._id;
			db.deleteRelationship(relationship_id, function(err, success){ // store the id of the relationship where?
				if (err)
				{
					console.log(err);
					throw err;
				}

					// Output result
				console.log(success);
				
				if( callbackDone !== null && typeof callbackDone === 'function') {
					callbackDone(success);
				}				
			});
		}
	});
}

commander.createDocumentUserRelationship = function(from_document_id, to_user_id, type_of_relationship, data_of_relationship, callbackDone)
{
	getDocumentIdFromMongoID(from_document_id, function(node1){
		console.log(node1);
		//console.log("Neo4j document id from " + from_document_id + " is " + node1._id);
		
		getUserIdFromMongoID(to_user_id, function(node2){
			console.log(node2);
			//console.log("Neo4j user id from " + to_user_id + " is " + node2._id);
			console.log("Neo4j document id from " + from_document_id + " is " + node1._id);
			console.log("Neo4j user id from " + to_user_id + " is " + node2._id);
			console.log("Neo4j new relationship : " + node1._id + " - " + type_of_relationship + " - "  + node2._id);
			db.insertRelationship(node1._id, node2._id, type_of_relationship, data_of_relationship, function(err, relationship){
				if (err)
				{
					console.log(err);
					throw err;
				}

				// Output relationship
				console.log(relationship);
				
				if( callbackDone !== null && typeof callbackDone === 'function') {
					callbackDone(relationship);
				}				
			});
		});
	});
}

commander.createDocumentDocumentRelationship = function(from_document_id, to_document_id, type_of_relationship, data_of_relationship, callbackDone)
{
	getDocumentIdFromMongoID(from_document_id, function(node1){
		console.log(node1);
		//console.log("Neo4j document id from " + from_document_id + " is " + node1._id);
		
		getDocumentIdFromMongoID(to_document_id, function(node2){	
			console.log(node2);
			//console.log("Neo4j user id from " + from_document_id + " is " + node2._id);
			console.log("Neo4j document id from " + from_document_id + " is " + node1._id);
			console.log("Neo4j document id from " + to_document_id + " is " + node2._id);
			console.log("Neo4j new relationship : " + node1._id + " - " + type_of_relationship + " - "  + node2._id);			
			db.insertRelationship(node1._id, node2._id, type_of_relationship, data_of_relationship, function(err, relationship){
				if (err)
				{
					console.log(err);
					throw err;
				}
				/* // Output relationship properties.
				console.log(relationship.data);

				// Output relationship id.
				console.log(relationship._id);

				// Output relationship start_node_id.
				console.log(relationship._start);

				// Output relationship end_node_id.
				console.log(relationship._end); */
				// Output relationship
				console.log(relationship);
				
				if( callbackDone !== null && typeof callbackDone === 'function') {
					callbackDone(relationship);
				}				
			});
		});
	});
} 

commander.getFriendLists = function(user_id, callbackFunc){
	var query = 'MATCH (u:' + config.node_type.USER + ')-[r:' + config.relationship_type.USER_FRIEND_USER  + ']->(f:' + config.node_type.USER + ') WHERE ' +
	'u.mongo_id = \'' + user_id + '\' RETURN f';
	console.log(query);
	db.cypherQuery(query, function(err, result){
		if (err)
		{
			console.log(err);
			throw err;
		}
				
		console.log(result);
		if ( callbackFunc && typeof callbackFunc === 'function')
			callbackFunc(result);			
	});

}

commander.countRelationships = function(callbackFunc){
	var query = 'MATCH (:' + config.node_type.USER + ')-[r]->(:' + config.node_type.DOCUMENT + ') RETURN  type(r) AS rels, COUNT(type(r)) AS count ORDER BY rels';
	console.log(query);
	db.cypherQuery(query, function(err, result){
		if (err)
		{
			console.log(err);
			throw err;
		}
				
		console.log(result);
		if ( callbackFunc && typeof callbackFunc === 'function')
			callbackFunc(result);			
	});
}

commander.getSharedForDocument = function(user_id, callbackFunc){
/* 	var query = 'MATCH (d:' + config.node_type.DOCUMENT + ')-[r:' + config.relationship_type.DOCUMENT_SHARED_FOR_USER  + ']->(u:' + config.node_type.USER + ') WHERE ' +
	'u.mongo_id = \'' + user_id + '\' RETURN r,d'; */
	var query = 'MATCH p=(u1:' + config.node_type.USER + ')-[r1:' + config.relationship_type.USER_SHARE_DOCUMENT  + ']->(d:' + config.node_type.DOCUMENT + ')-[r2:' + config.relationship_type.DOCUMENT_SHARED_FOR_USER  + ']->(u2:' + config.node_type.USER + ') WHERE ' +
	'u2.mongo_id = \'' + user_id + '\' AND id(r1) = r2.fromShareTransaction RETURN u1,r1,d';
	console.log(query);
	db.cypherQuery(query, function(err, result){
		if (err)
		{
			console.log(err);
			throw err;
		}
				
		console.log(result);
		if ( callbackFunc && typeof callbackFunc === 'function')
			callbackFunc(result);			
	});

}

commander.getAllRatingsDocument = function(user_id, callbackFunc){
	// 	query = "MATCH p=(u:USER)-[r:RATE|LIKE|READ|SHARE|VIEW|DOWNLOAD]->(d:DOCUMENT)
	//         	WHERE u.mongo_id = '57bebede4ce7748824a36846'
	//         	Return p";
	//  config.relationship_type.USER_RATE_DOCUMENT 	 = "RATE";
	// 	config.relationship_type.USER_VIEW_DOCUMENT      = "VIEW";
	//	config.relationship_type.USER_DOWNLOAD_DOCUMENT  = "DOWNLOAD";
	//	config.relationship_type.USER_LIKE_DOCUMENT      = "LIKE";
	//	config.relationship_type.USER_SHARE_DOCUMENT     = "SHARE";
	//	config.relationship_type.USER_READ_DOCUMENT      = "READ";	
	
	var query = 'MATCH p=(u:' + config.node_type.USER + ')-[r:' + config.relationship_type.USER_RATE_DOCUMENT   + '|' + 
			config.relationship_type.USER_VIEW_DOCUMENT   + '|' + config.relationship_type.USER_DOWNLOAD_DOCUMENT   + '|' + 
			config.relationship_type.USER_LIKE_DOCUMENT   + '|' + config.relationship_type.USER_SHARE_DOCUMENT   + '|' +
			config.relationship_type.USER_READ_DOCUMENT   + ']->(d:' + config.node_type.DOCUMENT + ') WHERE ' +
			'u.mongo_id = \'' + user_id + '\' RETURN u,r,d';
	//console.log(query);
	db.cypherQuery(query, function(err, result){
		if (err)
		{
			console.log(err);
			throw err;
		}
				
		//console.log(result);
		if ( callbackFunc && typeof callbackFunc === 'function')
			callbackFunc(result);			
	});

}

commander.getAllPublicDocumentsOfFriends = function(user_id, callbackFunc){
	// 	query = "MATCH p=(u:USER)-[r:FRIEND]->(u2:USER)-[r2:RATE|VIEW|DOWNLOAD|UPLOAD|LIKE|SHARE|READ]->(d:DOCUMENT)
	// 				WHERE u.mongo_id = '57bebef14ce7748824a36847'
	// 				AND ( NOT(EXISTS(d.privacy)) OR d.privacy = "public" )
	// 				RETURN u,r,u2,r2,d;";
	//  config.relationship_type.USER_RATE_DOCUMENT 	 = "RATE";
	// 	config.relationship_type.USER_VIEW_DOCUMENT      = "VIEW";
	//	config.relationship_type.USER_DOWNLOAD_DOCUMENT  = "DOWNLOAD";
	//	config.relationship_type.USER_DOWNLOAD_DOCUMENT  = "USER_UPLOAD_DOCUMENT";
	//	config.relationship_type.USER_LIKE_DOCUMENT      = "LIKE";
	//	config.relationship_type.USER_SHARE_DOCUMENT     = "SHARE";
	//	config.relationship_type.USER_READ_DOCUMENT      = "READ";	
	
	var query = 'MATCH p=(u:' + config.node_type.USER + ')-[r:' + config.relationship_type.USER_FRIEND_USER + ']->(u2:' + config.node_type.USER +
			')-[r2:' +
			config.relationship_type.USER_RATE_DOCUMENT   + '|' + config.relationship_type.USER_VIEW_DOCUMENT   + '|' + 
			config.relationship_type.USER_DOWNLOAD_DOCUMENT   + '|' + config.relationship_type.USER_UPLOAD_DOCUMENT   + '|' + 
			config.relationship_type.USER_LIKE_DOCUMENT   + '|' + config.relationship_type.USER_SHARE_DOCUMENT   + '|' +
			config.relationship_type.USER_READ_DOCUMENT   + ']->(d:' + config.node_type.DOCUMENT + ') WHERE ' +
			' u.mongo_id = \'' + user_id + '\' ' + 
			' AND ( NOT(EXISTS(d.privacy)) OR d.privacy = "public" ) ' + 
			' RETURN u,r,u2,r2,d;';
	//console.log(query);
	db.cypherQuery(query, function(err, result){
		if (err)
		{
			console.log(err);
			throw err;
		}
				
		//console.log(result);
		if ( callbackFunc && typeof callbackFunc === 'function')
			callbackFunc(result);			
	});

}

module.exports = Neo4JCommander;

