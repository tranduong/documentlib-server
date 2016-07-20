var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var ShareSchema   = new schema({
	id : ObjectId,
	toUsers : [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	fromUser : {ref: "User", type: mongoose.Schema.Types.ObjectId},
	document: {ref: "Document", type: mongoose.Schema.Types.ObjectId}
},{ collection : 'Share' });
 
module.exports = mongoose.model('Share', ShareSchema, 'Share');