var mongoose     = require('mongoose');
var Document	 = require('./Document');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var UserSchema   = new schema({
	id : ObjectId,
	username: String,
    email: String,
    password: String,
	lastaccessed : String,	
    token: String,
	isDeleted : Boolean,
	uploadedDocs : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}]
},{ collection : 'User' });
 
module.exports = mongoose.model('User', UserSchema, 'User');