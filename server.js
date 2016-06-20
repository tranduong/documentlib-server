// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
//var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var path 	   = require('path');
var randToken  = require('rand-token');

// test tika
var tika	   = require('tika');

var config	   = require('./config/config');

var datetime   = new Date();
var accessedTime = datetime.toJSON();

var app        = express();

var port = process.env.PORT || 3001;
var User     = require('./models/User'); 
var Document = require('./models/Document'); 
var Uploader = require('./utils/UploadFile');
var Elastic  = require('./utils/ElasticSearchConnector.js');
 
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

app.get('/me', ensureAuthorized, function(req, res) {
    User.findOne({token: req.token, isDeleted: false},{password : 0, token : 0, _id :0}, function(err, user) {
        if (err) {
			console.log("Error occured: " + err);
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
			console.log("check me : " + user);
            res.json({
                type: true,
                data: user
            });
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
					docModel.publisher	   = fields.publisher;
					docModel.publishedDate = fields.publishedDate;
					docModel.category	   = fields.category;
					docModel.privacy   	   = fields.privacy;
					docModel.isDeleted	   = false;
					console.log("1. demomode: " + fields.demomode);
					docModel.save(function(err, doc1) {
						if (err)
						{
						/* 	res.json({
								type: false,
								data: "Error occured: " + err
							}); */
							console.log("Error when save the document information: ", err);
						}
						else
						{
							user.uploadedDocs.push(doc1);
							user.save(function(err, user1) {
								if (err)
								{
/* 									res.json({
										type: false,
										data: "Error occured: " + err
									}); */
									//console.log("Error when save the user with document: ", err);
								}
								else{
									console.log("The information of the Uploaded document has been stored in the database");
									// Upload the document to elastic server
									var elasticConnector = new Elastic();
									console.log("2. demomode: " + fields.demomode);
									elasticConnector.uploadDocument(doc1, fields.demomode, user._id, function(success){
										console.log("Elastic Server response : " + success );
									}, function(err){
										console.log("Elastic Server response : " + err );
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
	// Collect server information : documents, users, views, downloads, likes, reading, shared
	User.count({}, function( err, count){
		stats.users = count;
		console.log( "Number of users:", count );
		Document.count({},function(err, count){
			stats.documents = count;
			console.log( "Number of documents:", count );
			
			// Collect my information: upload documents, views, downloads, likes, readings, shared from me
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
					if (user)
					{
						stats.mydocs = user.uploadedDocs.length;
						console.log("===============STATISTICS===============");
						//console.log(user);
						console.log(stats);
						console.log("========================================");
						res.json(stats);
					}
					
				}
			});
		});
	});
});


app.get('/testtika',function(req,res){
	console.log("TESTING");
	tika.extract('E:/git/master_projects/server/documentlib/upload/2016/6/4KedMSVITODwGUbLcciQCOnX/Report_CHU.PDF', function(err, text, meta) {
		console.log(text); // Logs 'Just some text'.
		console.log(meta); // Logs 'LibreOffice 4.1'.
	});
	res.json('{"result":"Success"}');
});
// others utility functions
process.on('uncaughtException', function(err) {
    console.log(err);
});

// Start Server
app.listen(port, function () {
    console.log( "Scientific Document Library Management - Express server listening on port " + port);
});