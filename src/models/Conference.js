var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var ObjectId	 = schema.ObjectId;

var ConferenceSchema   = new schema({
	id : ObjectId,	
	title: String,
	acronym: String,
	documents : [{ref: "Document", type: mongoose.Schema.Types.ObjectId}],
	ranks : [{
				source : String,
				rank : String,
				average_rating : Number,
				year : String
			  }]
},{ collection : 'Conference' });
 
module.exports = mongoose.model('Conference', ConferenceSchema, 'Conference');