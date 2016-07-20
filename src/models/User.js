var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var UserSchema   = new schema({
	id : ObjectId,	
	isDeleted : Boolean,
	lastaccessed : String,	
	password: String,
    email: String,
	avatar_img: String,
	username: String,
    token: String,
	followers : [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	followees : [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	friends: [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	request_friends: [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	wait_response_friends: [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	roles : [{ref: "Role", type: mongoose.Schema.Types.ObjectId}],
	communities : [{ref: "Community", type: mongoose.Schema.Types.ObjectId}],
	teams : [{ref: "Team", type: mongoose.Schema.Types.ObjectId}],
	groups : [{ref: "Group", type: mongoose.Schema.Types.ObjectId}],
	likes : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	reads : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	uploadedDocs : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	downloadedDocs : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	viewedDocs : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	sharedTransactions : [{ toFriends : [{ref: "User", type: mongoose.Schema.Types.ObjectId}],							
							document: {ref: "Document", type: mongoose.Schema.Types.ObjectId},
							sharedText: String,
							time : String
							}]
},{ collection : 'User' });
 
module.exports = mongoose.model('User', UserSchema, 'User');