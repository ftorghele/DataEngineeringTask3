var config = require('./config.js');
var fs = require("fs");
var db = require("mongojs").connect(
    config.MONGODB_DB_URL
  , config.MONGODB_COLLECTIONS
);

fs.readFile("data/subjclueslen_with_emotes.tff", "utf-8", function(err, data){
  var dict = {};
  var lines = data.trim().split('\n');
  var n = lines.length;
  for(var i = 0; i < n; i++){
    var line = lines[i];
    var key = line.slice( line.indexOf("word1=")+6, line.indexOf("pos1=")-1 );
    var value = line.slice( line.indexOf("priorpolarity=")+14, line.length );
    dict[key] = value;
  }

  db.slang_replaced.find({}).forEach(function(err, doc) {
    if (!doc) {
      db.close();
      return;
    }
    var words = doc.text.split(" ");
    var sentiment = 0;
    words.forEach(function(word) {
      for ( var key in dict ) {
        if (word == key) {
          wordSentiment = dict[key];
          if (wordSentiment === "negative") {
            sentiment -= 1;
          } else if (wordSentiment === "positive") {
            sentiment += 1;
          }
          break;
        }
      }
    });

    db.sentiment.save({
      source: doc.source
    , sentiment: sentiment
    , text: doc.text
    , geo:  doc.geo
    , country: doc.country
    }, function(err, saved) {
      if( err || !saved ) {
        console.log("Tweet not saved");
      }
    });
  }); 
});

