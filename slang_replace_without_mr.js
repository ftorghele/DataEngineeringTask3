var config = require('./config.js');
var fs = require("fs");
var csv = require("csv");
var db = require("mongojs").connect(
    config.MONGODB_DB_URL
  , config.MONGODB_COLLECTIONS
);

csv().from.path(__dirname+'/data/slangdict.csv', { delimiter: ';' }).to.array( function(data){
  var dict = {};
  for(var i = 0; i < data.length; i++){
    dict[data[i][0]] = data[i][1];
  }

  db.tweets.find({}).forEach(function(err, doc) {
    if (!doc) {
      db.close();
      return;
    }
    var slang = doc.text.split(" ");
    var words = [];
    slang.forEach(function(value) {
      var word = value;
      for ( var key in dict ) {
        if (value == key) {
	  word = dict[key];
          break;
        }
      }
      words.push(word);
    });

    db.slang_replaced.save({
      source: doc.source
    , text: words.join(" ")
    , geo:  doc.geo
    , country: doc.country
    }, function(err, saved) {
      if( err || !saved ) {
        console.log("Tweet not saved");
      }
    });
  }); 
});

