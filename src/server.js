// Required Modules
var fs = require('fs');
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
//var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var path 	   = require('path');
var randToken  = require('rand-token');
var mime = require('mime');

// test tika
//var tika	   = require('tika');

var config	   = require('./config/config');

var datetime   = new Date();
var accessedTime = datetime.toJSON();

var app        	= express();

var port 		= process.env.PORT || 3001;
var User     	= require('./models/User'); 
var Document    = require('./models/Document');
var Category 	= require('./models/Category'); 
var Author    	= require('./models/Author'); 
var Community  	= require('./models/Community'); 
var Conference 	= require('./models/Conference'); 
var Journal      = require('./models/Journal'); 
var Organization = require('./models/Organization'); 
var Publisher    = require('./models/Publisher'); 
var Role 	= require('./models/Role'); 
var Team 	= require('./models/Team'); 
var Group   = require('./models/Group'); 

var Uploader 		= require('./utils/UploadFile');
var Elastic  		= require('./utils/ElasticSearchConnector');
var Neo4JCommander 	= require('./utils/Neo4JCommander');
var Utils 			= require('./utils/Utils');
var Utility 		= new Utils();
var InteractManager = require('./utils/UserInteractionManager');
var actionManager   = new InteractManager();

mongoose.connection.on('open', function (ref) {
  console.log('Connected to mongo server.');
});

mongoose.connection.on('error', function (err) {
  console.log('Could not connect to mongo server!');
  console.log(err);
});

// Connect to DB
mongoose.connect(config.database.URL);
// Document Service functions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,Accept,X-Requested-With,content-type,Authorization');
    next();
});

app.use(express.static(__dirname));

app.get('/view', function(req, res){
  console.log("View action : ");
  var filePath = req.query.p;
  if ( filePath !== "undefined")
  {
	  var file = __dirname + "/" + filePath;

	  var filename = path.basename(file);
	  var mimetype = mime.lookup(file);

	  var filestream = fs.createReadStream(file);
	  filestream.pipe(res);
  }
});

app.get('/download', function(req, res){
  console.log("download action");
  var filePath = req.query.p;
  if ( filePath !== "undefined")
  {
	  var file = __dirname + "/" + filePath;

	  var filename = path.basename(file);
	  var mimetype = mime.lookup(file);

	  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	  res.setHeader('Content-type', mimetype);

	  var filestream = fs.createReadStream(file);
	  filestream.pipe(res);
  }
});
// Authentication Service functions
app.post('/authen', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password, isDeleted: false},{password : 0}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
			/* User.count({},function(err, count) {
                       console.log(count+' records found in Users model');//Prints 2 records
                       c=count;     
					   
            }); */
            if (user) {
				console.log("User authenticated: " + user);
				user.lastaccessed = accessedTime;
				user.token = ""; // clear last token
				user.token = randToken.generate(16) + "" + user._id;
				user.save(function(err, user1) {
					if(err)
					{
						console.log("Error occured: " + err);
						 res.json({
							type: false,
							data: "Error occured: " + err
						});
					}
					else{
						console.log("User logged in: " + user1);
						res.json({
							type: true,
							data: user1
						});
					}
				});
            } else {
				console.log("Incorrect email/password - " +  req.body.email + " - password " + req.body.password );
				res.json({
							type: false,
							data: "Incorrect email/password - " +  req.body.email + " - password " + req.body.password 
						});                    
            }
        }
    });
});

app.post('/signup', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password, isDeleted: false},{password : 0, token : 0, _id :0}, function(err, user) {
        if (err) {
			console.log("Error occured: " + err);
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
				console.log("User already exists! - " + user);
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
				console.log("User from request : " + req);
                var userModel = new User();
				userModel.username 		= req.body.username;
                userModel.email 		= req.body.email;
                userModel.password 		= req.body.password;
				userModel.lastaccessed 	= accessedTime;
				userModel.isDeleted 	= false;
                userModel.save(function(err, user) {
                    user.token = randToken.generate(16) + "" + user._id;
                    user.save(function(err, user1) {
						if(err)
						{
							console.log("Error occured: " + err);
							res.json({
								type: false,
								data: "Error occured: " + err
							});
						}
						else{
							// Insert information of the user to elastic server
							var elasticConnector = new Elastic();
							elasticConnector.insertUser(user1, function(success){
								console.log("Elastic Server response : " + success );
							}, function(err){
								console.log("Elastic Server response : " + err );
							});
							
							
							// Insert a User Node to Neo4J
							var commander = new Neo4JCommander();
							commander.createUserNode(user1);
							
							// return the registered User Information
							console.log("User registered: " + user1);
							user1.password = "";
							res.json({
								type: true,
								data: user1
							});
						}
                    });
                })
            }
        }
    });
});

app.get('/me', function(req, res) {
	console.log("Me function called");
/* 		.populate('followers', {username : 1, email : 1, avatar_img : 1, id : 1})
		.populate('followees', {username : 1, email : 1, avatar_img : 1, id : 1})
		.populate('friends', {username : 1, email : 1, avatar_img : 1, id : 1}) */
    User.findOne({token: req.token, isDeleted: false},{password : 0, token: 0})
		.exec( function(err, user) {
			if (err) {
				console.log("Error occured: " + err);
				res.json({
					type: false,
					data: "Error occured: " + err
				});
			} else {
				console.log("======================ME=====================");
				console.log(user);
				console.log("=============================================");
				res.json({
					type: true,
					data: user
				});
			}
		});
});

app.get('/getUserInformation', ensureAuthorized, function(req, res) {
	console.log("getUserInformation function called");
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0}, function(err, user) {
		if ( err ){
			console.log("Error occured: " + err);
			res.json({
				type: false,
				data: "Error occured: " + err
			});
		}
		else{
			if ( user )
			{
				var userid = req.query.userid;
				if ( userid !== user._id )
				{
					User.findOne({_id: userid, isDeleted: false},{password : 0, token: 0})
						.populate('followers', {username : 1, email : 1, avatar_img : 1, id : 1})
						.populate('followees', {username : 1, email : 1, avatar_img : 1, id : 1})
						.populate('friends', {username : 1, email : 1, avatar_img : 1, id : 1})
						.exec( function(err, user1) {
							if (err) {
								console.log("Error occured: " + err);
								res.json({
									type: false,
									data: "Error occured: " + err
								});
							} else {
								console.log("======================User Information=====================");
								console.log(user1);
								console.log("=============================================");
								res.json({
									type: true,
									data: user1
								});
							}
						});
				}
				else
				{
					console.log("======================User Information=====================");
					console.log(user);
					console.log("=============================================");
					res.json({
						type: true,
						data: user
					});
				}
			}
			else{
				console.log("Error occured: User is not found");
				res.json({
					type: false,
					data: "Error occured: User is not found"
				});
			}
		}
		
	});
});

function ensureAuthorized(req, res, next) {
    var bearerToken;
	//console.log("request headers : " + req.headers["authorization"]);
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


app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/uploadDoc',ensureAuthorized, function(req, res) {
	console.log("Run upload");

	var uploadHelper = new Uploader();
	uploadHelper.uploadSimple(req,res, function(strFileName, strFilePath, fields){
		console.log("Token is: " + req.token);
		User.findOne({token: req.token, isDeleted: false}, function(err, user) {
			if (err)
			{
				res.json({
					type: false,
					data: "Error occured: " + err
				}); 
				console.log("Error when finding user :", err);
			}
			else
			{
				if (user)
				{
					console.log("title = " + fields.title);
					console.log("authors = " + fields.authors);
					console.log("=============USER==============");
					console.log(user);
					console.log("===============================");
					var docModel = new Document();
					docModel.uploadedPath  = strFilePath;
					docModel.fileName 	   = strFileName;
					docModel.title		   = fields.title;
					docModel.authors	   = fields.authors;
					docModel.uploadedDate  = (new Date()).toJSON();
					docModel.uploadedUser  = user.email;
					docModel.abstract  	   = fields.abstract;
					docModel.keywords  	   = fields.keywords;
					docModel.publisher	   = fields.publisher;
					docModel.publishedDate = fields.publishedDate;
					docModel.category	   = fields.category;
					docModel.privacy   	   = fields.privacy;
					docModel.isDeleted	   = false;
					console.log("1. demomode: " + fields.demomode);
					docModel.save(function(err, doc1) {
						if (err)
						{
						 	res.json({
								type: false,
								data: "Error occured: " + err
							}); 
							console.log("Error when save the document information: ", err);
						}
						else
						{
							user.uploadedDocs.push(doc1);
							user.save(function(err, user1) {
								if (err)
								{
 									res.json({
										type: false,
										data: "Error occured: " + err
									}); 
									//console.log("Error when save the user with document: ", err);
								}
								else{
									console.log("The information of the Uploaded document has been stored in the database");
									// Insert information of the document to elastic server
									var elasticConnector = new Elastic();
									console.log("2. demomode: " + fields.demomode);
									elasticConnector.uploadDocument(doc1, fields.demomode, user._id, function(success){
										console.log("Elastic Server response : " + success );
									}, function(err){
										console.log("Elastic Server response : " + err );
									});
									
									// Insert a document Node on Neo4J Graph Database
									var commander = new Neo4JCommander();
									commander.createDocumentNode(doc1, function(result){
										var data =  { time : (new Date()).toJSON() };
										console.log(data);
										actionManager.processInteraction(config.relationship_type.USER_UPLOAD_DOCUMENT, user, doc1._id, data, function(err, success){
											if ( err ){
												console.log("Interaction error : " + err );
												res.json({
													type: false,
													data: "Error occured: " + err
												}); 
											}
											else{
												console.log(success);
												res.json({
													type: true,
													data: result
												}); 
											}											
										});
									});
									
								}
							});
							
						}
					});
				}
				else{
					res.json({
						type: false,
						data: "Error occured: " + "User is not existed"
					}); 
					console.log("User is not existed");
				}
			}
		});
	},function(err){
		res.end("Error occured: " + err);
	},function(){
		res.end("Success");
	});
	
	
});

app.get('/mydocs', ensureAuthorized, function(req,res){
	//console.log("token is: ", req.token);
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0, _id :0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("Get my documents : " + err);
		}
		else
		{
			if ( user )
			{
				//console.log("GET my documents : " + user.username);
				
				Document.find({
						'_id': { $in: user.uploadedDocs},
						isDeleted: false
					}, null, {sort: {uploadedDate: -1 }},function(err, docs){
						if (err)
						{
							console.log("Error in retreiving docs: " + err);
							res.json({
								type: false,
								data: "Error occured: "  + err
							});	
						}
						else{
							if ( docs )
							{
			 					res.json({
									type: true,
									data: docs
								});	
								//console.log("documents: " + docs);
							}
							else
							{
								res.json({
									type: true,
									data: ""
								});
								console.log("No document found!");
							}
						}				 
				});			
			}
			else
			{
				console.log("GET my documents : " + "Can't find the user");
				res.json({
					type: false,
					data: "Error occured: "  + "Can't find the user"
				});		 		
			}
		}		
	});
});

app.get('/myfriends', ensureAuthorized, function(req,res){
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("Get my friends : " + err);
		}
		else
		{
			console.log(user._id);
			if ( user && user._id !== 'undefined' )
			{
				var commander = new Neo4JCommander();
				commander.getFriendLists(user._id, function(result){
					var ids = [];
					console.log(result.data);
					for(var i = 0; i < result.data.length; i ++)
					{
						console.log(result.data[i]);
						ids.push(mongoose.Types.ObjectId(result.data[i].mongo_id));
					}
					console.log(ids);
					if (ids.length > 0 )
					{
						User.find({
							'_id': {$in: ids},
							isDeleted: false
						}, {_id:1, email:1, username: 1}, function(err, users){
							if (err) throw err;
							console.log(users);
							res.json({
								type: true,
								data: users
							});	
						});
					}
					else
					{
						res.json({
							type: true,
							data: []
						});	
					}
				});				
			}
			else
			{
				console.log("GET my friends list : " + "Can't find the user");
				res.json({
					type: false,
					data: "Error occured: "  + "Can't find the user"
				});		 		
			}
		}		
	});
});
// DOING FIX with UPDATING
app.post('/updatedocument', ensureAuthorized, function(req,res){
	//console.log("update my document information: ");
	//console.log(req.body);
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("Get my documents : " + err);
		}
		else
		{
			if ( user )
			{	
				Document.update({_id: req.body._id}, req.body, function(err, affected, resp) {	  
					if (err)
					{
						//console.log("error :" + err);
						res.json({
							type: false,
							data: err
						});
					}
					else
					{
						// Update the document in elastic server
						var elasticConnector = new Elastic();
						var doc = req.body;
						elasticConnector.updateDocument(doc, user._id, function(success){
							console.log("Elastic Server response : " + success );
						}, function(err){
							console.log("Elastic Server response : " + err );
						});
						
						res.json({
							type: true,
							data: resp
						})
						//console.log("update document successfully");
					}
				});
			}
		}
	});
});

app.post('/deletedocument', ensureAuthorized, function(req,res){	
	console.log("delete one of my document");
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("Get my documents : " + err);
		}
		else
		{
			if ( user )
			{	
				Document.update({_id: req.body._id}, {isDeleted: true}, function(err, affected, resp) {	
			/* 		console.log("Delete function");
					console.log("==================================");
					console.log("Error:");
					console.log(err);
					console.log("Affected:");
					console.log(affected);
					console.log("Response:");
					console.log(resp);
					console.log("=================================="); */
					if (err)
					{
						console.log("error :" + err);
						res.json({
							type: false,
							data: err
						})
					}
					else
					{
						Document.findOne({_id: req.body._id, isDeleted: true}, function(err, doc) {
							if (err)
							{
								console.log("error :" + err);
								res.json({
									type: false,
									data: err
								})
							}
							else
							{
								// Delete the content in search engine
								var elasticConnector = new Elastic();
								elasticConnector.deleteDocument(doc.privacy, doc._id, user._id, function(success){
									console.log("Elastic Server response : " + success );
								}, function(err){
									console.log("Elastic Server response : " + err );
								});
							}
						});
						
						res.json({
							type: true,
							data: resp
						})
						console.log("deleted document successfully");
					}
				});
			}
		}
	});
});

app.get('/stats', ensureAuthorized, function(req,res){
	var stats = {};
	var uid = req.query.uid;
	// Collect server information : documents, users, views, downloads, likes, reading, shared
	User.count({}, function( err, count){
		stats.users = count;
		console.log( "Number of users:", count );
		Document.count({},function(err, count){
			stats.documents = count;
			console.log( "Number of documents:", count );
			
			// Collect my information: upload documents, views, downloads, likes, readings, shared from me
			User.findOne({_id: uid, isDeleted: false},{password : 0, token : 0}, function(err, user) {
				if (err)
				{			
					res.json({
						type: false,
						data: "Error occured: " + err
					}); 
					console.log("Get my documents : " + err);
				}
				else
				{
					var commander = new Neo4JCommander();
					commander.countRelationships(function(result){
						var resultStr = "";
						console.log("Run here: " + result.data.length);
						for ( var i = 0; i < result.data.length; i++ )
						{
							
							resultStr = resultStr + "\"" + result.data[i][0] + "\" : " + result.data[i][1];
							if ( i != result.data.length - 1)
							{
								resultStr = resultStr + ",";
							}							
						}
						resultStr = "{" + resultStr + "}";
						console.log(resultStr);
						stats.relations = JSON.parse(resultStr);
						console.log("===============STATISTICS===============");
						//console.log(user);
						console.log(stats);
						console.log("========================================");
						res.json(stats);
					});
				}
			});
		});
	});
});

////// USER INTERACTION TRACKING PART ===========================>>>>>
app.post('/userInteractDocument', ensureAuthorized, function(req,res){
	console.log("Interact Document");
	console.log(req.body);	
	User.findOne({token: req.token, isDeleted: false}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("user Interaction Document : " + err);
		}
		else
		{
			if ( user ){
				var data = req.body;
				var typeOfRelation  = Utility.getTypeOfRelation(data.the_action);				
				var destDocument	= data.doc_id;
				var relationData	= {};
				
				if ( data.the_data !== 'undefined')
					relationData = data.the_data;
				
				actionManager.processInteraction(typeOfRelation, user, destDocument, relationData, function(err, success){
					if (err){
						console.log(err);
						res.json({
							type: false,
							data: "Error occured: " + err
						})
					}
					else{
						console.log(success);
						res.json({
							type: true,
							data: "Success"
						})
					}
				})
			}
			else{
				console.log("user Interaction cannot find the user");
			}
		}
	});	
});

// get the downloaded documents to list them up
app.get('/mydownloadeddocuments', ensureAuthorized, function(req,res){
	//console.log("token is: ", req.token);
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0, _id :0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("Get my downloaded documents : " + err);
		}
		else
		{
			if ( user )
			{
				console.log("GET my downloaded documents : " + user.username);	

				Document.find({
						'_id': { $in: user.downloadedDocs},
						isDeleted: false
					}, null, null, function(err, docs){
						if (err)
						{
							console.log("Error in retreiving docs: " + err);
							res.json({
								type: false,
								data: "Error occured: "  + err
							});	
						}
						else{
							if ( docs )
							{
								console.log(docs);
			 					res.json({
									type: true,
									data: docs
								});	
								//console.log("documents: " + docs);
							}
							else
							{
								res.json({
									type: true,
									data: ""
								});
								console.log("No downloaded document found!");
							}
						}				 
				});			
			}
			else
			{
				console.log("GET my downloaded  documents : " + "Can't find the user");
				res.json({
					type: false,
					data: "Error occured: "  + "Can't find the user"
				});		 		
			}
		}		
	});
});

// get the liked documents to list them up
app.get('/mylikeddocuments', ensureAuthorized, function(req,res){
	//console.log("token is: ", req.token);
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0, _id :0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("Get my like documents : " + err);
		}
		else
		{
			if ( user )
			{
				console.log("GET my like documents : " + user.username);	

				Document.find({
						'_id': { $in: user.likes},
						isDeleted: false
					}, null, null, function(err, docs){
						if (err)
						{
							console.log("Error in retreiving docs: " + err);
							res.json({
								type: false,
								data: "Error occured: "  + err
							});	
						}
						else{
							if ( docs )
							{
								console.log(docs);
			 					res.json({
									type: true,
									data: docs
								});	
								//console.log("documents: " + docs);
							}
							else
							{
								res.json({
									type: true,
									data: ""
								});
								console.log("No like document found!");
							}
						}				 
				});			
			}
			else
			{
				console.log("GET my like documents : " + "Can't find the user");
				res.json({
					type: false,
					data: "Error occured: "  + "Can't find the user"
				});		 		
			}
		}		
	});
});

// get the reading documents to list them up
app.get('/myreadingdocuments', ensureAuthorized, function(req,res){
	//console.log("token is: ", req.token);
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0, _id :0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("Get my reading documents : " + err);
		}
		else
		{
			if ( user )
			{
				console.log("GET my reading documents : " + user.username);	

				Document.find({
						'_id': { $in: user.reads},
						isDeleted: false
					}, null, null, function(err, docs){
						if (err)
						{
							console.log("Error in retreiving docs: " + err);
							res.json({
								type: false,
								data: "Error occured: "  + err
							});	
						}
						else{
							if ( docs )
							{
								console.log(docs);
			 					res.json({
									type: true,
									data: docs
								});	
								//console.log("documents: " + docs);
							}
							else
							{
								res.json({
									type: true,
									data: ""
								});
								console.log("No reading document found!");
							}
						}				 
				});			
			}
			else
			{
				console.log("GET my reading documents : " + "Can't find the user");
				res.json({
					type: false,
					data: "Error occured: "  + "Can't find the user"
				});		 		
			}
		}		
	});
});

// get the shared documents to list them up
app.get('/myshareddocuments', ensureAuthorized, function(req,res){
	//console.log("token is: ", req.token);
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("Get my shared documents : " + err);
		}
		else
		{
			if ( user )
			{
				console.log("GET my shared documents : " + user.username);	
				console.log("GET my shared documents : " + user._id);					
				Document.find({ 'beSharedTransactions' : { $elemMatch : {
						'fromUser' : user._id
					  }},
					  'isDeleted': false
					  }, null, null, function(err, docs){
						if (err)
						{
							console.log("Error in retreiving docs: " + err);
							res.json({
								type: false,
								data: "Error occured: "  + err
							});	
						}
						else{
							if ( docs )
							{
								console.log(docs);
			 					res.json({
									type: true,
									data: docs
								});	
								//console.log("documents: " + docs);
							}
							else
							{
								res.json({
									type: true,
									data: ""
								});
								console.log("No shared document found!");
							}
						}				 
				});			
			}
			else
			{
				console.log("GET my shared documents : " + "Can't find the user");
				res.json({
					type: false,
					data: "Error occured: "  + "Can't find the user"
				});		 		
			}
		}		
	});
});
////// USER INTERACTION TRACKING PART ===========================<<<<<

// Process Social Network acitivities
//// Process Friend Request, Friend Response Confirm, Follow Confirm
////// Request Friend
app.post('/requestFriend', ensureAuthorized, function(req,res){
	console.log("request Friend");
	console.log(req.body);	
	User.findOne({token: req.token, isDeleted: false}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("user request friend : " + err);
		}
		else
		{
			if ( user )
			{
				var friend_id = req.body.friend_id;
				
				if ( friend_id !== 'undefined')
				{
					if ( user._id.equals(friend_id) ) return;  // prevent self make friend
					
					if ( user.friends.indexOf(friend_id) !== -1 )
					{
						console.log("The user has already been my friend");
					}
					else{
						User.findOne({_id: friend_id, isDeleted: false}, function(err1, user1){
							if (err1){
								res.json({
									type: false,
									data: "Error occured: " + err1
								}); 
							}
							else
							{
								if ( user1.request_friends.indexOf(user._id) === -1 ){
									user1.request_friends.push(user._id);
									user1.save(function(err2, user2) {
										if ( err2 ) {
											res.json({
												type: false,
												data: "Error occured: " + err2
											}); 
										}
										else
										{
										
											// console.log(user2);
											user.wait_response_friends.push(friend_id);
											user.save(function(err3, user3) {
												if ( err3 ) {
													res.json({
														type: false,
														data: "Error occured: " + err3
													}); 
												}											
												else
												{
													// console.log(user3);

													res.json({
														type: true,
														data: "Success"
													}); 						
												}
											});
										}											
									});								
								}
								else
								{
									res.json({
										type: false,
										data: "Failed friend request sent"
									}); 
									console.log("The user has already request to make friend with the another");
								}
							}							
						});
						
					}
				}
			}
			else{
				res.json({
					type: false,
					data: "request friend cannot find the user"
				}); 
				console.log("request friend cannot find the user");
			}
		}
	});	
});

////// response Friend Request 
app.post('/requestResponse', ensureAuthorized, function(req,res){
	console.log("request Friend Response");
	console.log(req.body);	
	User.findOne({token: req.token, isDeleted: false}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("user response friend : " + err);
		}
		else
		{
			if ( user ){
				var friend_id = req.body.friend_id;		
				
				if ( friend_id !== 'undefined')
				{
					if ( user._id.equals(friend_id) ) return;  // prevent self make friend
					// find the request friends
					var index = user.request_friends.indexOf(friend_id);
					if ( user.friends.indexOf(friend_id) !== -1 )
					{
						console.log("The user has already been a friend");
						user.request_friends.slice(index, 1);
						user.save(function(err,user3){
							if ( err ){
								res.json({
									type: false,
									data: "Error occured: " + err
								}); 
							}
							console.log("user updated");
						});
					}
					else{
						User.findOne({_id: friend_id, isDeleted: false}, function(err1, user1){
							if (err1){
								res.json({
									type: false,
									data: "Error occured: " + err1
								}); 
							}
							var idx = user1.wait_response_friends.indexOf(user._id);
							// If user has been a friends of current user
							if ( user1.friends.indexOf(user._id) !== -1 )
							{
								console.log("The user was a friend");
								user.request_friends.slice(index, 1);
								user.save(function(err,user3){
									if ( err ) {
										res.json({
											type: false,
											data: "Error occured: " + err
										}); 
									}
									console.log("user updated");
								});
								
								user1.wait_response_friends.slice(idx, 1);
								user1.save(function(err,user2){
									if ( err ) {
										res.json({
											type: false,
											data: "Error occured: " + err
										}); 
									}
									console.log("user updated");
								});
							}
							else
							{
								if ( index !== -1 && idx !== -1 ){
									user.request_friends.slice(index, 1);
									user.friends.push(friend_id)
									user.save(function(err,user3){
										if ( err ) {
											res.json({
												type: false,
												data: "Error occured: " + err
											}); 
										}
										console.log("user updated");
										
										// console.log(user3);
										user1.wait_response_friends.slice(idx, 1);
										user1.friends.push(user._id);
										user1.save(function(err2, user2) {
											if ( err2 ){
												res.json({
													type: false,
													data: "Error occured: " + err2
												}); 
											}
											
											// console.log(user2);
											
											// Update the relationship between two User
											var commander = new Neo4JCommander();
											var data = {date : new Date()};
											commander.createUserUserRelationship(user._id, friend_id, config.relationship_type.USER_FRIEND_USER, data, function(result){
												// console.log(result);
												commander.createUserUserRelationship(friend_id, user._id, config.relationship_type.USER_FRIEND_USER, data, function(result){
													// console.log(result);
													res.json({
														type: true,
														data: "Success"
													}); 
												});
											});
											
										});					
									});												
								}
								else
								{
									res.json({
										type: false,
										data: "The user has already response to make friend with the another"
									}); 
									console.log("The user has already response to make friend with the another");
								}
							}
						});
						
					}
				}
				else
				{
					res.json({
						type: false,
						data: "No friend_id"
					}); 
				}
			}
			else{
				res.json({
					type: false,
					data: "response friend cannot find the user"
				}); 
				console.log("response friend cannot find the user");
			}
		}
	});	
});

////// confirm followers
app.post('/confirmFollow', ensureAuthorized, function(req,res){
	console.log("request Friend confirm follow");
	console.log(req.body);	
	User.findOne({token: req.token, isDeleted: false}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("user confirm follow : " + err);
		}
		else
		{
			var follower_id = req.body.follower_id;

			if ( follower_id !== 'undefined')
			{
				if ( user._id.equals(follower_id) ) return;  // prevent self make friend
				console.log("==== Follower list ====");
				console.log(user.followers);
				console.log("==== End of Follower list ====");
				if ( user.followers.indexOf(follower_id) !== -1 )
				{
					console.log("The user has already been followed");						
				}
				else{
					User.findOne({_id: follower_id, isDeleted: false}, function(err1, user1){
						if (err1){			
							res.json({
								type: false,
								data: "Error occured: " + err1
							}); 
						}				
						if ( user1.followees.indexOf(user._id) !== -1 )
						{
							console.log("The user has followed the another");								
						}
						else
						{	
							user.followers.push(follower_id)
							user.save(function(err,user3){
								if ( err ){			
									res.json({
										type: false,
										data: "Error occured: " + err
									}); 
								}				
								console.log("user updated");
								
								// console.log(user3);
								user1.followees.push(user._id);
								user1.save(function(err2, user2) {
									if ( err2 ){			
										res.json({
											type: false,
											data: "Error occured: " + err2
										}); 
									}				
									// console.log(user2);
									
									// Update the relationship between two User
									var commander = new Neo4JCommander();
									var data = {date : new Date()};
									commander.createUserUserRelationship(user._id, follower_id, config.relationship_type.USER_FOLLOWS_USER , data, function(result){
										// console.log(result);
										commander.createUserUserRelationship(follower_id, user._id, config.relationship_type.USER_FOLLOWED_BY_A_USER , data, function(result){
											// console.log(result);
											res.json({
												type: true,
												data: "Success"
											}); 
										});
									});
									
								});					
							});												
							
						}
					});
					
				}
			}
		}
	});
});
//////// USER PROFILE AND TIMELINES VIEW
// get the user's reading documents to list them up
app.get('/userReadingDocs', ensureAuthorized, function(req,res){
	//console.log("token is: ", req.token);
	//console.log(req);
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("get User Reading Documents : " + err);
		}
		else
		{
			if ( user )
			{
				var other_user_id = req.query.userid;
				console.log("get reading documents from other users: " + other_user_id);	
				if ( user.friends.indexOf(other_user_id) 	!== -1 ||
					 user.followers.indexOf(other_user_id) 	!== -1 ||
					 user.followees.indexOf(other_user_id) 	!== -1 )
				{
					User.findOne({_id: other_user_id, isDeleted: false},{password : 0, token : 0, _id :0}, function(err1, other_user) {
						if (err1)
						{
							console.log("Error in retreiving docs: " + err1);
							res.json({
								type: false,
								data: "Error occured: "  + err1
							});	
						}
						else
						{
							if ( other_user )
							{
								Document.find({
										'_id': { $in: other_user.reads},
										isDeleted: false,
										privacy: "public"
									}, null, null, function(err, docs){
										if (err)
										{
											console.log("Error in retreiving docs: " + err);
											res.json({
												type: false,
												data: "Error occured: "  + err
											});	
										}
										else{
											if ( docs )
											{
												console.log(docs);
												res.json({
													type: true,
													data: docs
												});	
												//console.log("documents: " + docs);
											}
											else
											{
												res.json({
													type: true,
													data: ""
												});
												console.log("No reading document found!");
											}
										}				 
								});
							}
							else
							{
								res.json({
									type: false,
									data: "Error occured: "  + "Can't find the other user"
								});		 	
							}
						}
					});
				}
				else
				{
					console.log("<" + user._id + "> compare with <"+ other_user_id + ">" );
					if ( user._id == other_user_id )
					{
						Document.find({
										'_id': { $in: user.reads},
										isDeleted: false
									}, null, null, function(err, docs){
										if (err)
										{
											console.log("Error in retreiving docs: " + err);
											res.json({
												type: false,
												data: "Error occured: "  + err
											});	
										}
										else{
											if ( docs )
											{
												console.log(docs);
												res.json({
													type: true,
													data: docs
												});	
												//console.log("documents: " + docs);
											}
											else
											{
												res.json({
													type: true,
													data: ""
												});
												console.log("No reading document found!");
											}
										}				 
								});
					}
					else
					{
						res.json({
							type: false,
							data: "User is not one of your friends, followers or followees, it's prohibited to see their activities"
						});
					}
				}
			}
			else
			{
				console.log("GET my reading documents : " + "Can't find the user");
				res.json({
					type: false,
					data: "Error occured: "  + "Can't find the user"
				});		 		
			}
		}		
	});
});

app.get('/sharedForMeDocuments', ensureAuthorized, function(req,res){
	User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0}, function(err, user) {
		if (err)
		{			
			res.json({
				type: false,
				data: "Error occured: " + err
			}); 
			console.log("Get shared to me documents : " + err);
		}
		else
		{
			console.log(user._id);
			if ( user && user._id !== 'undefined' )
			{
				var commander = new Neo4JCommander();
				commander.getSharedForDocument(user._id, function(result){
					var ids = [];
					/* console.log("===========SERVER=============");
					console.log(result.data);
					console.log("=============================="); */
					for(var i = 0; i < result.data.length; i ++)
					{
						console.log(result.data[i][2].mongo_id);
						ids.push(mongoose.Types.ObjectId(result.data[i][2].mongo_id));
					}
					console.log(ids);
					if (ids.length > 0 )
					{
						Document.find({
							'_id': {$in: ids},
							isDeleted: false
						}, function(err, docs){
							if (err) throw err;
							/* console.log("===========DOCUMENTS=============");
							console.log(docs);
							console.log("================================="); */
							sharedTransactions = [];
							for(var i = 0; i < result.data.length; i ++)
							{
								var datarow = [];
								console.log(result.data[i][2].mongo_id);
								for(var j = 0; j < docs.length; j ++)
								{
									if (docs[j]._id == result.data[i][2].mongo_id)
									{
										datarow.push(result.data[i][0]);
										datarow.push(result.data[i][1]);
										datarow.push(docs[j]);
										break;
									}
								}
								
								sharedTransactions.push(datarow);
							}
							
							console.log("==============RESULT=============");							
							console.log(sharedTransactions);
							console.log("=================================");
							res.json({
								type: true,
								data: sharedTransactions
							});	
						});
					}
					else
					{
						res.json({
							type: true,
							data: []
						});	
					}
				});				
			}
			else
			{
				console.log("GET my share to me documents : " + "Can't find the user");
				res.json({
					type: false,
					data: "Error occured: "  + "Can't find the user"
				});		 		
			}
		}		
	});
});
/* app.get('/testtika',function(req,res){
	console.log("TESTING");
	tika.extract('E:/git/master_projects/server/documentlib/upload/2016/6/4KedMSVITODwGUbLcciQCOnX/Report_CHU.PDF', function(err, text, meta) {
		console.log(text); // Logs 'Just some text'.
		console.log(meta); // Logs 'LibreOffice 4.1'.
	});
	res.json('{"result":"Success"}');
}); */

app.post('/recommendTopN', ensureAuthorized,function(req,res){
	console.log("Recommend Top N");
	console.log(req.body);
	
});

// others utility functions
process.on('uncaughtException', function(err) {
    console.log(err);
});

// Start Server
app.listen(port, function () {
    console.log( "Scientific Document Library Management - Express server listening on port " + port);
});