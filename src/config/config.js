var config = {};

config.database = {};
config.searchengine = {};
config.graphdb = {};
config.relationship_type = {};
config.redis = {};
config.node_type = {};

// config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];
// Main Database - MongoDB
config.database.URL				= process.env.MONGO_URL || "mongodb://localhost:27017/documentlib";

// Search Engine - ElasticSearch
config.searchengine.HOST		= "localhost";
config.searchengine.PORT		= 9200;

// Graph Database - Neo4J
config.graphdb.URL				= process.env.NEO4J_URL || "http://neo4j:12345@localhost:7474/";

// NODE_RELATIONSHIP_TYPE
// (USER) - [r] - (USER)
config.relationship_type.USER_FOLLOWS_USER 		 = "FOLLOW";
config.relationship_type.USER_FOLLOWED_BY_A_USER = "FOLLOWED";
config.relationship_type.USER_FRIEND_USER 		 = "FRIEND";

// (USER) - [r] - (DOCUMENT)
config.relationship_type.USER_RATE_DOCUMENT 	 = "RATE";
config.relationship_type.USER_VIEW_DOCUMENT      = "VIEW";
config.relationship_type.USER_DOWNLOAD_DOCUMENT  = "DOWNLOAD";
config.relationship_type.USER_UPLOAD_DOCUMENT    = "UPLOAD";
config.relationship_type.USER_LIKE_DOCUMENT      = "LIKE";
config.relationship_type.USER_COMMENT_DOCUMENT   = "COMMENT";
config.relationship_type.USER_SHARE_DOCUMENT     = "SHARE";
config.relationship_type.USER_READ_DOCUMENT      = "READ";
config.relationship_type.USER_UNLIKE_DOCUMENT	 = "UNLIKE"; // remove a like relationship in graph
config.relationship_type.USER_STOP_READ_DOCUMENT = "STOP_READ"; // only change the information of reading in mongodb


// (DOCUMENT) - [r] - (USER)
config.relationship_type.DOCUMENT_SHARED_FOR_USER  = "SHARED_FOR";

// (DOCUMENT) - [r] - (DOCUMENT)
config.relationship_type.DOCUMENT_CITE_DOCUMENT   = "CITE_TO";
config.relationship_type.DOCUMENT_REFER_DOCUMENT  = "REFERRED_BY";
config.relationship_type.DOCUMENT_SUCCEED_BY_DOCUMENT    = "SUCCESSOR";
config.relationship_type.DOCUMENT_PRECEDED_BY_DOCUMENT   = "PREDECESSOR";

// Structure of Data for relationships
//config.relationship_type.DATA_TYPE_1 = "{ time : {1} }";

config.node_type.DOCUMENT = 'DOCUMENT';
config.node_type.USER     = 'USER';

module.exports = config;