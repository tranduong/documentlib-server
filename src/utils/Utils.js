var config = require('../config/config');

function Utils() {

}

var utils = Utils.prototype;

utils.getTypeOfRelation = function(strAction, req, res){
	if ( strAction === "rate"){
		return config.relationship_type.USER_RATE_DOCUMENT;
	}
	else if ( strAction === "view"){
		return config.relationship_type.USER_VIEW_DOCUMENT;
	}
	else if ( strAction === "download"){
		return config.relationship_type.USER_DOWNLOAD_DOCUMENT;
	}
	else if ( strAction === "upload"){
		return config.relationship_type.USER_UPLOAD_DOCUMENT;
	}
	else if ( strAction === "like"){
		return config.relationship_type.USER_LIKE_DOCUMENT;
	}
	else if ( strAction === "comment"){
		return config.relationship_type.USER_COMMENT_DOCUMENT;
	}
	else if ( strAction === "share"){
		return config.relationship_type.USER_SHARE_DOCUMENT;
	}
	else if ( strAction === "read"){
		return config.relationship_type.USER_READ_DOCUMENT;
	}
	else if ( strAction === "unlike"){
		return config.relationship_type.USER_UNLIKE_DOCUMENT;
	}
	else if ( strAction === "stopread"){
		return config.relationship_type.USER_STOP_READ_DOCUMENT;
	}
}

module.exports = Utils;