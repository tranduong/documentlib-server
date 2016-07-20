var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var TeamSchema   = new schema({
	id : ObjectId,
	name: String,
	desc: String,
	logo: String,
	members : [{ref: "User", type: mongoose.Schema.Types.ObjectId}]
},{ collection : 'Team' });
 
module.exports = mongoose.model('Team', TeamSchema, 'Team');