
var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId     = schema.ObjectId;
var DocumentSchema   = new schema({
	id : ObjectId,
	isDeleted: Boolean,
	privacy: {type: String, required: true},
	category: String,
	publishedDate: String,
	publisher: String,
    abstract: String,
	uploadedUser: String,
	uploadedDate: String,
    authors: String,
    title: {type : String, default : '', required : true},
	fileName: String,
	uploadedPath: String,
	journal_title : String,
	first_conference : String,
	thumbnail_img : String,
	citedBy : String,
	citedByLinks : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	citingTo : String,
	citingToLinks : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	liked_by : [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	read_by : [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	downloaded_by : [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	viewed_by : [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
	beSharedTransactions : [{ fromUser : {ref: "User", type: mongoose.Schema.Types.ObjectId},
							toUsers : [{ref: "User", type: mongoose.Schema.Types.ObjectId}],							
							sharedText : String,
							time : String
							}]
},{ collection : 'Document' });
 
module.exports = mongoose.model('Document', DocumentSchema, 'Document');