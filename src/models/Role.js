var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var RoleSchema   = new schema({
	id : ObjectId,	
	name: String
},{ collection : 'Role' });
 
module.exports = mongoose.model('Role', RoleSchema, 'Role');