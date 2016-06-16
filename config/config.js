var config = {};

config.database = {};
config.searchengine = {};
config.redis = {};

// config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];
config.database.URL				= process.env.MONGO_URL || "mongodb://127.0.0.1:27017/documentlib";
config.searchengine.HOST		= "localhost";
config.searchengine.PORT		= 9200;

module.exports = config;