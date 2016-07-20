var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var AuthorSchema   = new schema({
	id : ObjectId,	
	name: String,
	address: String,
	ownedDocs : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}]
},{ collection : 'Author' });
 
module.exports = mongoose.model('Author', AuthorSchema, 'Author');