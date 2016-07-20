var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var CommunitySchema   = new schema({
	id : ObjectId,
	name: String,
	desc: String,
	members : [{ref: "User", type: mongoose.Schema.Types.ObjectId}]
},{ collection : 'Community' });
 
module.exports = mongoose.model('Community', CommunitySchema, 'Community');