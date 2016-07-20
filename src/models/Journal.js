var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var JournalSchema   = new schema({
	id : ObjectId,	
	title: String,
	country: String,
	ISSN: String,
	type: String,
	documents : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	ranks : [{
			Srj : Number,
			H_index : String,
			total_docs_this_year : Number,
			total_docs_3_ryears : Number,
			total_refs_this_year : Number,
			total_cites_3_ryears : Number,
			total_citable_docs_3ryears : Number,
			rate_of_cites_over_docs : Number,
			rate_of_cites_over_docs : Number,
			rate_of_refs_over_docs : Number,
			year : String
		  }]
},{ collection : 'Journal' });
 
module.exports = mongoose.model('Journal', JournalSchema, 'Journal');