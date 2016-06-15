var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId     = schema.ObjectId;
var DocumentSchema   = new schema({
	id : ObjectId,
	fileName: String,
	uploadedPath: String,
	uploadedDate: String,
	uploadedUser: String,
    title: String,
    authors: String,
	publisher: String,
    publishedDate: String,
	abstract: String,
	category: String,
	privacy: String,
	isDeleted: Boolean
},{ collection : 'Document' });
 
module.exports = mongoose.model('Document', DocumentSchema, 'Document');