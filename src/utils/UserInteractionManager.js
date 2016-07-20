var config  		= require('../config/config');
var Neo4JCommander 	= require('../utils/Neo4JCommander');
var User     		= require('../models/User'); 
var Document    	= require('../models/Document');

function UserInteractionManager() {

}

var userInteract = UserInteractionManager.prototype;


function processCommentInteraction(user, doc_id, data, callbackFun)
{
	console.log("Prepare Comment Relationship between User <" + user._id + "> and Document <" + doc_id + "> with data " + data);
	// to be developed
}

function processRateInteraction(user, doc_id, data, callbackFun)
{
	console.log("Prepare Rate Relationship between User <" + user._id + "> and Document <" + doc_id + "> with data " + data);
	// to be developed
}

function processShareInteraction(user, doc_id, data, callbackFun)
{
	var err  = "";
	var succ = "";
	console.log("Prepare Share Relationship between User <" + user._id + "> and Document <" + doc_id + "> with data " + data);
	console.log(data);
	if ( user )
	{
		// Validate the input data
		if ( doc_id === null || data.toFriends.length <= 0 ) 
		{
			err = "Input data for sharing transaction is not valid";
			console.log(err);
			if ( callbackFun && typeof callbackFun === "function")		
			{
				callbackFun(err, null);			
			}
			return;
		}
		// Insert the document into viewedDocs collection of the User
		if ( typeof user.sharedTransactions === 'undefined')
		{
			user.sharedTransactions = [];
		}
		
		var datetime   = new Date();
		var sharedTime = datetime.toJSON();
		var sharedTransactionData = {};
		sharedTransactionData.document 		= doc_id;
		sharedTransactionData.sharedText 	= data.shareText;
		sharedTransactionData.toFriends		= [];
		
		for ( var i = 0; i < data.toFriends.length; i++)
		{			
			sharedTransactionData.toFriends.push(data.toFriends[i]._id);
		}
		sharedTransactionData.time			= sharedTime;
		
		// User are accepted to share a document many-time to many-people, and the shared Time is tracked in database both in graph and document database
		user.sharedTransactions.push(sharedTransactionData);

		user.save(function(err, user1) {
			if (err)
			{
				if ( callbackFun && typeof callbackFun === "function")
				{
					callbackFun(err, null);
				}
				console.log("Cannot save user information");
			}
			else{
				Document.findOne({_id: doc_id, isDeleted: false}, function(err, doc) {
					if (err)
					{
						if ( callbackFun && typeof callbackFun === "function")
						{
							callbackFun(err, null);
						}
						console.log("Cannot find the document information");
					}
					else{
						if (doc)
						{
							if ( typeof doc.beSharedTransactions === 'undefined')
							{
								doc.beSharedTransactions = [];
							}
							
							var beSharedTransactionData = {};
							beSharedTransactionData.fromUser 	= user._id;
							beSharedTransactionData.sharedText 	= data.shareText;
							beSharedTransactionData.toUsers 	= [];
							for ( var j = 0; j < data.toFriends.length; j++)
							{
								beSharedTransactionData.toUsers.push(data.toFriends[j]._id);
							}
							beSharedTransactionData.time		= sharedTime;
							// Insert data into beSharedTransaction collection of the Document
							doc.beSharedTransactions.push(beSharedTransactionData);
							
							doc.save(function(err, doc1) {
								if (err)
								{
									if ( callbackFun && typeof callbackFun === "function")
									{
										callbackFun(err, null);
									}
									console.log("Cannot save the document information");
								}
								else
								{
									// Insert the relationship data between user and document
									var commander = new Neo4JCommander();
									var relationAttributes = {};
									//relationAttributes.to   		= data.toFriends;									
									relationAttributes.sharedText 	= data.shareText;
									relationAttributes.time			= sharedTime;
									commander.createUserDocumentRelationship(user._id, doc_id, config.relationship_type.USER_SHARE_DOCUMENT, relationAttributes, function(result){
										console.log(result);
										if ( result === false )
										{
											err = "Cannot create the SHARE relationship between the User <" + user._id + "> and the Document <" + doc_id + ">";
											if ( callbackFun && typeof callbackFun === "function")
											{
												callbackFun(err, succ);
											}
										}
										else
										{
											var user_id = null;
											var itemsProcessed = 0;
											for ( var k = 0; k < data.toFriends.length; k++)
											{
												var relationDatas = {};
												//relationDatas.fromUser 				= user._id;
												relationDatas.fromShareTransaction 	= result._id;
												//relationDatas.sharedText 			= data.shareText;
												//relationDatas.time					= sharedTime;
												user_id								= data.toFriends[k]._id;
												console.log("Chay vao day 2 : " + k + " doc :<" + doc_id + "> to <" + user_id + ">");
												commander.createDocumentUserRelationship(doc_id, user_id , config.relationship_type.DOCUMENT_SHARED_FOR_USER, relationDatas, function(result1){
													if (result1 === false)
													{
														err = "Cannot create the SHARE_FOR relationship between the Document <" + doc_id + "> and the User <" + user_id + ">";
													}
													else
													{
														succ = "Success";
														itemsProcessed++;
														console.log("Processed : " + itemsProcessed);
														if( itemsProcessed == data.toFriends.length ) {
															if ( callbackFun && typeof callbackFun === "function")
															{
																callbackFun(err, succ);
															}
														}
													}
												});
											}
										}
									});
								}
							});
						}
						else
						{
							err = "Cannot find the document";
							if ( callbackFun && typeof callbackFun === "function")
							{
								callbackFun(err, succ);
							}
							console.log(err);
						}
					}
				});
			}
		});
	}
	else{
		err = "User is not defined";
		if ( callbackFun && typeof callbackFun === "function")
		{
			callbackFun(err, succ);
		}
		console.log(err);
	}
	
}
// COMPLETED
userInteract.processInteraction = function(relationship_type, user, doc_id, data, callbackFun){
	if ( relationship_type === config.relationship_type.USER_RATE_DOCUMENT)
	{
		processRateInteraction(user, doc_id, data, callbackFun);
	}
	else if ( relationship_type === config.relationship_type.USER_VIEW_DOCUMENT)
	{
		processViewInteraction(user, doc_id, data, callbackFun);
	}	
	else if ( relationship_type === config.relationship_type.USER_DOWNLOAD_DOCUMENT)
	{
		processDownloadInteraction(user, doc_id, data, callbackFun);
	}	
	else if ( relationship_type === config.relationship_type.USER_UPLOAD_DOCUMENT)
	{
		processUploadInteraction(user, doc_id, data, callbackFun);
	}	
	else if ( relationship_type === config.relationship_type.USER_LIKE_DOCUMENT)
	{
		processLikeInteraction(user, doc_id, data, callbackFun);
	}
	else if ( relationship_type === config.relationship_type.USER_COMMENT_DOCUMENT)
	{
		processCommentInteraction(user, doc_id, data, callbackFun);
	}
	else if ( relationship_type === config.relationship_type.USER_SHARE_DOCUMENT)
	{
		processShareInteraction(user, doc_id, data, callbackFun);
	}	
	else if ( relationship_type === config.relationship_type.USER_READ_DOCUMENT)
	{
		processReadInteraction(user, doc_id, data, callbackFun);
	}
	else if ( relationship_type === config.relationship_type.USER_UNLIKE_DOCUMENT)
	{
		processUnlikeInteraction(user, doc_id, callbackFun);
	}
	else if ( relationship_type === config.relationship_type.USER_STOP_READ_DOCUMENT)
	{
		processStopReadInteraction(user, doc_id, data, callbackFun);
	}

}

function processStopReadInteraction(user, doc_id, data, callbackFun)
{
	console.log("Prepare Stop Read Relationship between User <" + user._id + "> and Document <" + doc_id + "> with data " + data);
	if ( user )
	{
		// Don't remove the read history the relationship data between user and document
		
		// Remove the reading information in the document storage
		Document.findOne({_id: doc_id, isDeleted: false}, function(err, doc) {
			if (err)
			{
				callbackFun(err, null);
				console.log("Cannot find the document information");
			}
			else{
				if (doc)
				{
					if ( typeof doc.read_by !== 'undefined')
					{				
						var idx = doc.read_by.indexOf(user._id);						
						if ( idx !== -1 )
						{											
							// Delete the user from Liked_by collection of the Document									
							doc.read_by.splice(idx, 1);
							doc.save(function(err, doc1) {
								if (err)
								{
									callbackFun(err, null);
									console.log("Cannot save the document information");
								}
								else
								{
									// clear the liked_by history in document
									console.log("clear the read_by history in the document")
								}
							});
						}
					}
				}
				else{
					console.log("Cannot find the document");
				}
			}
		});
		
		// Remove the like information of the User
		if ( typeof user.reads !== 'undefined')
		{
			var idx = user.reads.indexOf(doc_id);
			if (idx !== -1 )
			{				
				user.reads.splice(idx, 1);
				user.save(function(err, user1) {
					if (err)
					{
						callbackFun(err, null);
						console.log("Cannot save user information");
					}
					else
					{
						succ = "Success";
						if ( callbackFun && typeof callbackFun === "function")
						{
							callbackFun(err, succ);
						}
					}
				});
			}
		}
	}
	else{
		console.log("User is not defined");
	}
}

function processUnlikeInteraction(user, doc_id, callbackFun)
{
	console.log("Prepare Unlike Relationship between User <" + user._id + "> and Document <" + doc_id + "> ");
		
	if ( user )
	{
		// Delete the relationship data between user and document
		var commander = new Neo4JCommander();

		commander.deleteUserDocumentRelationship(user._id, doc_id, config.relationship_type.USER_LIKE_DOCUMENT, function(result){
			console.log(result);
			var err  = "";
			var succ = "";
			if ( result === false )
			{
				err = "Cannot delete the LIKE relationship between the User <" + user._id + "> and the Document <" + doc_id + ">";
			}
			else
			{
				console.log("Remove the relationship on graph database");
			}
			
		});		
		
		Document.findOne({_id: doc_id, isDeleted: false}, function(err, doc) {
			if (err)
			{
				callbackFun(err, null);
				console.log("Cannot find the document information");
			}
			else{
				if (doc)
				{
					if ( typeof doc.liked_by !== 'undefined')
					{				
						var idx = doc.liked_by.indexOf(user._id);						
						if ( idx !== -1 )
						{											
							// Delete the user from Liked_by collection of the Document									
							doc.liked_by.splice(idx, 1);
							doc.save(function(err, doc1) {
								if (err)
								{
									callbackFun(err, null);
									console.log("Cannot save the document information");
								}
								else
								{
									// clear the liked_by history in document
									console.log("clear the liked_by history in the document")
								}
							});
						}
					}
				}
				else{
					console.log("Cannot find the document");
				}
			}
		});
		
		// Remove the like information of the User
		if ( typeof user.likes !== 'undefined')
		{
			var idx = user.likes.indexOf(doc_id);
			if (idx !== -1 )
			{				
				user.likes.splice(idx, 1);
				user.save(function(err, user1) {
					if (err)
					{
						callbackFun(err, null);
						console.log("Cannot save user information");
					}
					else
					{
						succ = "Success";
						if ( callbackFun && typeof callbackFun === "function")
						{
							callbackFun(err, succ);
						}
					}
				});
			}
		}
	}
	else{
		console.log("User is not defined");
	}
}


function processDownloadInteraction(user, doc_id, data, callbackFun)
{
	console.log("Prepare Download Relationship between User <" + user._id + "> and Document <" + doc_id + "> with data " + data);
	if ( user )
	{
		// Insert the document into Likes collection of the User
		if ( typeof user.downloadedDocs === 'undefined')
		{
			user.downloadedDocs = [];
		}
		
		// User is accepted to download a document many-time, and the views Time is tracked in database but the least recent download will be tracked on graph
		user.downloadedDocs.push(doc_id);
		user.save(function(err, user1) {
			if (err)
			{
				callbackFun(err, null);
				console.log("Cannot save user information");
			}
			else{
				Document.findOne({_id: doc_id, isDeleted: false}, function(err, doc) {
					if (err)
					{
						callbackFun(err, null);
						console.log("Cannot find the document information");
					}
					else{
						if (doc)
						{
							if ( typeof doc.downloaded_by === 'undefined')
							{
								doc.downloaded_by = [];
							}
							

							// Insert the user into downloaded_by collection of the Document
							doc.downloaded_by.push(user._id);
							doc.save(function(err, doc1) {
								if (err)
								{
									callbackFun(err, null);
									console.log("Cannot save the document information");
								}
								else
								{
									// Insert the relationship data between user and document
									var commander = new Neo4JCommander();

									commander.createUserDocumentRelationship(user._id, doc_id, config.relationship_type.USER_DOWNLOAD_DOCUMENT, data, function(result){
										console.log(result);
										var err  = "";
										var succ = "";
										if ( result === false )
										{
											err = "Cannot create the DOWNLOAD relationship between the User <" + user._id + "> and the Document <" + doc_id + ">";
										}
										else{
											succ = "Success";
										}

										if ( callbackFun && typeof callbackFun === "function")
										{
											callbackFun(err, succ);
										}
									});
								}
							});
						}
						else{
							console.log("Cannot find the document");
						}
					}
				});
			}
		});
	}
	else{
		console.log("User is not defined");
	}
}

function processViewInteraction(user, doc_id, data, callbackFun)
{
	console.log("Prepare View Relationship between User <" + user._id + "> and Document <" + doc_id + "> with data " + data);
	if ( user )
	{
		// Insert the document into viewedDocs collection of the User
		if ( typeof user.viewedDocs === 'undefined')
		{
			user.viewedDocs = [];
		}
		
		// User are accepted to view a document many-time, and the views Time is tracked in database but the least recent view will be tracked on graph
		user.viewedDocs.push(doc_id);
		user.save(function(err, user1) {
			if (err)
			{
				callbackFun(err, null);
				console.log("Cannot save user information");
			}
			else{
				Document.findOne({_id: doc_id, isDeleted: false}, function(err, doc) {
					if (err)
					{
						callbackFun(err, null);
						console.log("Cannot find the document information");
					}
					else{
						if (doc)
						{
							if ( typeof doc.viewed_by === 'undefined')
							{
								doc.viewed_by = [];
							}
							
							
							// Insert the user into viewed_by collection of the Document
							doc.viewed_by.push(user._id);
							doc.save(function(err, doc1) {
								if (err)
								{
									callbackFun(err, null);
									console.log("Cannot save the document information");
								}
								else
								{
									// Insert the relationship data between user and document
									var commander = new Neo4JCommander();

									commander.createUserDocumentRelationship(user._id, doc_id, config.relationship_type.USER_VIEW_DOCUMENT, data, function(result){
										console.log(result);
										var err  = "";
										var succ = "";
										if ( result === false )
										{
											err = "Cannot create the VIEW relationship between the User <" + user._id + "> and the Document <" + doc_id + ">";
										}
										else{
											succ = "Success";
										}

										if ( callbackFun && typeof callbackFun === "function")
										{
											callbackFun(err, succ);
										}
									});
								}
							});
						}
						else{
							console.log("Cannot find the document");
						}
					}
				});
			}
		});
	}
	else{
		console.log("User is not defined");
	}
}


function processReadInteraction(user, doc_id, data, callbackFun)
{
	if ( user )
	{
		// Insert the document into reads collection of the User
		if ( typeof user.reads === 'undefined')
		{
			user.reads = [];
		}
		
		if ( user.reads.indexOf(doc_id) !== -1 )
		{
			callbackFun("The user has read the document", null);
		}
		else{
			user.reads.push(doc_id);
			user.save(function(err, user1) {
				if (err)
				{
					callbackFun(err, null);
					console.log("Cannot save user information");
				}
				else{
					Document.findOne({_id: doc_id, isDeleted: false}, function(err, doc) {
						if (err)
						{
							callbackFun(err, null);
							console.log("Cannot find the document information");
						}
						else{
							if (doc)
							{
								if ( typeof doc.read_by === 'undefined')
								{
									doc.read_by = [];
								}
								
								if ( doc.read_by.indexOf(user._id) !== -1 )
								{
									callbackFun("The document has been read by the user", null);
								}
								else{
									// Insert the user into Liked_by collection of the Document
									doc.read_by.push(user._id);
									doc.save(function(err, doc1) {
										if (err)
										{
											callbackFun(err, null);
											console.log("Cannot save the document information");
										}
										else
										{
											// Insert the relationship data between user and document
											var commander = new Neo4JCommander();

											commander.createUserDocumentRelationship(user._id, doc_id, config.relationship_type.USER_READ_DOCUMENT, data, function(result){
												console.log(result);
												var err  = "";
												var succ = "";
												if ( result === false )
												{
													err = "Cannot create the READ relationship between the User <" + user._id + "> and the Document <" + doc_id + ">";
												}
												else{
													succ = "Success";
												}

												if ( callbackFun && typeof callbackFun === "function")
												{
													callbackFun(err, succ);
												}
											});
										}
									});
								}
							}
							else{
								console.log("Cannot find the document");
							}
						}
					});
				}
			});
		}
	}
	else{
		console.log("User is not defined");
	}
}

function processLikeInteraction(user, doc_id, data, callbackFun)
{
	if ( user )
	{
		// Insert the document into Likes collection of the User
		if ( typeof user.likes === 'undefined')
		{
			user.likes = [];
		}
		
		if ( user.likes.indexOf(doc_id) !== -1 )
		{
			callbackFun("The user has liked the document", null);
		}
		else{
			user.likes.push(doc_id);
			user.save(function(err, user1) {
				if (err)
				{
					callbackFun(err, null);
					console.log("Cannot save user information");
				}
				else{
					Document.findOne({_id: doc_id, isDeleted: false}, function(err, doc) {
						if (err)
						{
							callbackFun(err, null);
							console.log("Cannot find the document information");
						}
						else{
							if (doc)
							{
								if ( typeof doc.liked_by === 'undefined')
								{
									doc.liked_by = [];
								}
								
								if ( doc.liked_by.indexOf(user._id) !== -1 )
								{
									callbackFun("The document has been liked by the user", null);
								}
								else{
									// Insert the user into Liked_by collection of the Document
									doc.liked_by.push(user._id);
									doc.save(function(err, doc1) {
										if (err)
										{
											callbackFun(err, null);
											console.log("Cannot save the document information");
										}
										else
										{
											// Insert the relationship data between user and document
											var commander = new Neo4JCommander();

											commander.createUserDocumentRelationship(user._id, doc_id, config.relationship_type.USER_LIKE_DOCUMENT, data, function(result){
												console.log(result); // this result contain the _start, _end and relationship _id
												var err  = "";
												var succ = "";
												if ( result === false )
												{
													err = "Cannot create the LIKE relationship between the User <" + user._id + "> and the Document <" + doc_id + ">";
												}
												else{
													succ = "Success";
												}

												if ( callbackFun && typeof callbackFun === "function")
												{
													callbackFun(err, succ);
												}
											});
										}
									});
								}
							}
							else{
								console.log("Cannot find the document");
							}
						}
					});
				}
			});
		}
	}
	else{
		console.log("User is not defined");
	}
}

function processUploadInteraction(user, doc_id, data, callbackFun)
{
	if ( user )
	{
		// Insert the relationship data between user and document
		var commander = new Neo4JCommander();
		// After create the Document, update the Upload relationship between User and Document
		commander.createUserDocumentRelationship(user._id, doc_id, config.relationship_type.USER_UPLOAD_DOCUMENT, data, function(result){
			if (result == true){
				callbackFun(null, "Success");
			}
			else{
				callbackFun("Cannot create Upload relationship between User <" + user._id + "> and Document <" + doc_id + ">", null);
			}
		});
	}
}


module.exports = UserInteractionManager;