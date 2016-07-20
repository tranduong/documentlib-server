var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var CategorySchema   = new schema({
	id : ObjectId,	
	name: String,
	desc: String,
	documents : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	subCats : [{ref: "Category", type: mongoose.Schema.Types.ObjectId}],
	parentCat : {ref: "Category", type: mongoose.Schema.Types.ObjectId}
},{ collection : 'Category' });
 
module.exports = mongoose.model('Category', CategorySchema, 'Category');