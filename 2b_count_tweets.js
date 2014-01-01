var config = require('./config.js');
var db = require("mongojs").connect(
    config.MONGODB_DB_URL
  , config.MONGODB_COLLECTIONS
);

var map = function() {
  emit(this.tweets, {count:1}); 
};

var reduce = function(key, values) {
  var result = { count: 0 };
  values.forEach(function(value) {
    result.count += value.count;
  });
  return result;
};

db.tweets.mapReduce(map, reduce, {
  out: "2b_tweets_count"
});

db.close();
