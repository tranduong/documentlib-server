var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var OrgSchema   = new schema({
	id : ObjectId,
	name: String,
	desc: String,
	address: String,
	image: String,
	email: String,
	telephone: String,
	fax: String,
	staffs : [{ref: "User", type: mongoose.Schema.Types.ObjectId}]
},{ collection : 'Organization' });
 
module.exports = mongoose.model('Organization', OrgSchema, 'Organization');