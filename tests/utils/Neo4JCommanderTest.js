var chai = require('chai');
var expect = chai.expect;
var Neo4JCommander = require('./../../src/utils/Neo4JCommander');
var Document = require('./../../src/models/Document');
var User 	 = require('./../../src/models/User');
var config = require('./../../src/config/config');

describe('Neo4JCommander-1 Node', function(){
	it('creating first Document Node should be success', function(){
		commander = new Neo4JCommander();
		
		doc = new Document();
		doc.mongo_id = "12312ccdddd123aaaddd1123";
		console.log("Before run create Document");
		commander.createDocumentNode(doc);
		console.log("=========================");
	});
	
	it('creating second Document Node should be success', function(){
		commander = new Neo4JCommander();
		
		doc = new Document();
		doc.mongo_id = "189674dbde123d4467811223";
		console.log("Before run create Document");
		commander.createDocumentNode(doc);
		console.log("=========================");
	});
	
	it('creating third Document Node should be success', function(){
		commander = new Neo4JCommander();
		
		doc = new Document();
		doc.mongo_id = "99674eeff123ddcfbbb23413";
		console.log("Before run create Document");
		commander.createDocumentNode(doc);
		console.log("=========================");
	});
	
	it('creating first User Node should be success', function(){
		commander = new Neo4JCommander();
		
		user = new User();
		user.mongo_id = "12312aaabb123cccddd12123";
		console.log("Before run create User");
		commander.createUserNode(user);
		console.log("=========================");
	});
	
	it('creating second User Node should be success', function(){
		commander = new Neo4JCommander();
		
		user = new User();
		user.mongo_id = "1212ccc12133dbabde123123";
		console.log("Before run create User");
		commander.createUserNode(user);
		console.log("=========================");
	});
	
	it('creating third User Node should be success', function(){
		commander = new Neo4JCommander();
		
		user = new User();
		user.mongo_id = "89796dd12133dbabd4123123";
		console.log("Before run create User");
		commander.createUserNode(user);
		console.log("=========================");
	});
	
	it('creating a real User Node should be success', function(){
		commander = new Neo4JCommander();
		
		doc = new User();
		doc.mongo_id = "577a78334e46b27820cc3cfa";
		console.log("Before run create User");
		commander.createUserNode(doc);
		console.log("=========================");
	});
});

setTimeout(function(){
	// do nothing
},5000);

describe('Neo4JCommander-2 Relationship', function(){
	// USER to User
	it('create User Node to User Node Relationship should be success - part 1 - FOLLOW', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
			
				// (USER) - [r] - (USER)
				// NODE_RELATIONSHIP_TYPE
				console.log("Before run create Follow relationship");
				commander.createUserUserRelationship("12312aaabb123cccddd12123", "1212ccc12133dbabde123123", config.relationship_type.USER_FOLLOWS_USER, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
	});
	
	it('create User Node to User Node Relationship should be success - part 2 - FOLLOWED BY', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
			
				// (USER) - [r] - (USER)
				// NODE_RELATIONSHIP_TYPE

				console.log("Before run create Followed by relationship");
				commander.createUserUserRelationship("1212ccc12133dbabde123123", "12312aaabb123cccddd12123", config.relationship_type.USER_FOLLOWED_BY_A_USER, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	});

	it('create User Node to User Node Relationship should be success - part 3 - FRIEND', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
	
				// (USER) - [r] - (USER)
				// NODE_RELATIONSHIP_TYPE
				console.log("Before run create Friend relationship");
				commander.createUserUserRelationship("577a78334e46b27820cc3cfa", "89796dd12133dbabd4123123", config.relationship_type.USER_FRIEND_USER, null, null);
				console.log("=========================");
				resolve("Success");
				
				console.log("Before run create Friend relationship");
				commander.createUserUserRelationship("577a78334e46b27820cc3cfa", "12312aaabb123cccddd12123", config.relationship_type.USER_FRIEND_USER, null, null);
				console.log("=========================");
				resolve("Success");
				
				console.log("Before run create Friend relationship");
				commander.createUserUserRelationship("12312aaabb123cccddd12123", "89796dd12133dbabd4123123", config.relationship_type.USER_FRIEND_USER, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	});	

	// DOCUMENT TO USER
 	it('create Document Node to User Node Relationship should be success - SHARED FOR', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		

				// (DOCUMENT) - [r] - (USER)
				console.log("Before run create Shared_For relationship");
				commander.createDocumentUserRelationship("99674eeff123ddcfbbb23413", "1212ccc12133dbabde123123", config.relationship_type.DOCUMENT_SHARED_FOR_USER, null, null);
				console.log("=========================");
				
				commander.createDocumentUserRelationship("99674eeff123ddcfbbb23413", "89796dd12133dbabd4123123", config.relationship_type.DOCUMENT_SHARED_FOR_USER, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);	
		
	});
	
	// USER TO DOCUMENT
	it('create User Node to Document Node Relationship should be success - part 1 - RATE', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (USER) - [r] - (DOCUMENT)
				console.log("Before run create Rate relationship");
				commander.createUserDocumentRelationship("1212ccc12133dbabde123123", "189674dbde123d4467811223", config.relationship_type.USER_RATE_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
	});
	
	it('create User Node to Document Node Relationship should be success - part 2 - VIEW', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (USER) - [r] - (DOCUMENT)

				console.log("Before run create View relationship");
				commander.createUserDocumentRelationship("1212ccc12133dbabde123123", "189674dbde123d4467811223", config.relationship_type.USER_VIEW_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
	
	});
	
	it('create User Node to Document Node Relationship should be success - part 3 - DOWNLOAD', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (USER) - [r] - (DOCUMENT)
				console.log("Before run create Download relationship");
				commander.createUserDocumentRelationship("1212ccc12133dbabde123123", "189674dbde123d4467811223", config.relationship_type.USER_DOWNLOAD_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	});
	
	it('create User Node to Document Node Relationship should be success - part 4 - SHARE', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (USER) - [r] - (DOCUMENT)
				console.log("Before run create Share relationship");
				commander.createUserDocumentRelationship("1212ccc12133dbabde123123", "189674dbde123d4467811223", config.relationship_type.USER_SHARE_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	});	

	///////////////////////////
	it('create User Node to Document Node Relationship should be success - part 5.1 - LIKE', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (USER) - [r] - (DOCUMENT)
				
				console.log("Before run create Like relationship");
				commander.createUserDocumentRelationship("89796dd12133dbabd4123123", "99674eeff123ddcfbbb23413", config.relationship_type.USER_LIKE_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	});
	
	it('create User Node to Document Node Relationship should be success - part 5.2 - LIKE', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (USER) - [r] - (DOCUMENT)
				
				console.log("Before run create Like relationship");
				commander.createUserDocumentRelationship("1212ccc12133dbabde123123", "189674dbde123d4467811223", config.relationship_type.USER_LIKE_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	});	
	
	it('create User Node to Document Node Relationship should be success - part 6 - UPLOAD', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (USER) - [r] - (DOCUMENT)		
				
				console.log("Before run create Upload relationship");
				commander.createUserDocumentRelationship("89796dd12133dbabd4123123", "189674dbde123d4467811223", config.relationship_type.USER_UPLOAD_DOCUMENT, null, null);
				console.log("=========================");	
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
	
	});
	
	it('create User Node to Document Node Relationship should be success - part 7 - COMMENT', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (USER) - [r] - (DOCUMENT)

				console.log("Before run create Comment relationship");
				commander.createUserDocumentRelationship("1212ccc12133dbabde123123", "99674eeff123ddcfbbb23413", config.relationship_type.USER_COMMENT_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	});
	
	it('create User Node to Document Node Relationship should be success - part 8 - READ', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (USER) - [r] - (DOCUMENT)

				console.log("Before run create Comment relationship");
				commander.createUserDocumentRelationship("1212ccc12133dbabde123123", "99674eeff123ddcfbbb23413", config.relationship_type.USER_READ_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	});
	
	// Document to Document
	it('create Document Node to Document Node Relationship should be success - part 1 - CITE', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (DOCUMENT) - [r] - (DOCUMENT)

				console.log("Before run create Cite relationship");
				commander.createDocumentDocumentRelationship("12312ccdddd123aaaddd1123", "99674eeff123ddcfbbb23413", config.relationship_type.DOCUMENT_CITE_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
	}); 
	
	it('create Document Node to Document Node Relationship should be success - part 2 - CITE', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {
				var commander = new Neo4JCommander();		
				// (DOCUMENT) - [r] - (DOCUMENT)

				console.log("Before run create Cite relationship");
				commander.createDocumentDocumentRelationship("12312ccdddd123aaaddd1123", "189674dbde123d4467811223", config.relationship_type.DOCUMENT_CITE_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	}); 
	
	it('create Document Node to Document Node Relationship should be success - part 3 - REFER', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {						
				var commander = new Neo4JCommander();		
				// (DOCUMENT) - [r] - (DOCUMENT)

				console.log("Before run create Refer to relationship");
				commander.createDocumentDocumentRelationship("99674eeff123ddcfbbb23413", "189674dbde123d4467811223", config.relationship_type.DOCUMENT_REFER_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
		
	}); 
	
	it('create Document Node to Document Node Relationship should be success - part 4 - SUCCEED BY', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {						
				var commander = new Neo4JCommander();		
				// (DOCUMENT) - [r] - (DOCUMENT)
			
				console.log("Before run create Successor relationship");
				commander.createDocumentDocumentRelationship("99674eeff123ddcfbbb23413", "189674dbde123d4467811223", config.relationship_type.DOCUMENT_SUCCEED_BY_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);

	}); 
	
	it('create Document Node to Document Node Relationship should be success - part 5 - PRECEDED', function(done){
		var testPromise = new Promise(function(resolve, reject) {
			setTimeout(function() {						
				var commander = new Neo4JCommander();		
				// (DOCUMENT) - [r] - (DOCUMENT)
			
				console.log("Before run create Successor relationship");
				commander.createDocumentDocumentRelationship("189674dbde123d4467811223", "99674eeff123ddcfbbb23413", config.relationship_type.DOCUMENT_PRECEDED_BY_DOCUMENT, null, null);
				console.log("=========================");
				resolve("Success");
			}, 200) ;
		}) ;
		
		testPromise.then(function(result) {
			try
			{
				expect(result) . to. equal("Success") ;
				done() ;
			}
			catch (err)
			{
				done(err);
			}
		}, done);
	
	}); 

});
