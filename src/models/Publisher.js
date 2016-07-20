var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var PublisherSchema   = new schema({
	id : ObjectId,	
	name: String,
	address: String,
	publishedDocs : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}]
},{ collection : 'Publisher' });
 
module.exports = mongoose.model('Publisher', PublisherSchema, 'Publisher');