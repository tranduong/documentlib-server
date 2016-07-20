var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var GroupSchema   = new schema({
	id : ObjectId,
	name: String,
	desc: String,
	banner: String,
	members: [{ref: "User", type: mongoose.Schema.Types.ObjectId}]
},{ collection : 'Group' });
 
module.exports = mongoose.model('Group', GroupSchema, 'Group');