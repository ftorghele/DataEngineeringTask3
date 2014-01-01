var config = require('./config.js');
var fs = require("fs");
var csv = require("csv");
var db = require("mongojs").connect(
    config.MONGODB_DB_URL
  , config.MONGODB_COLLECTIONS
);

var map = function() {
  var words = this.text.split(" ");
  for(var i = 0; i < words.length; i++){
    emit(this._id, { source: this.source, word: words[i], geo: this.geo, country: this.country });   
  }
};

var reduce = function(key, values) {
  var words = [];
  values.forEach(function(value) {
    var word = value.word;
    for ( var key in slangDict ) {
      if (value.word == key) {
        word = slangDict[key];
        break;
      }
    }
    words.push(word);
  });
  return { source: values[0].source, text: words.join(" "), geo: values[0].geo, country: values[0].country };  
};

csv().from.path(__dirname+'/data/slangdict.csv', { delimiter: ';' }).to.array( function(data){
  var dict = {};
  for(var i = 0; i < data.length; i++){
    dict[data[i][0]] = data[i][1];
  }
  db.va.mapReduce(map, reduce, {
    out:   "2c_slang_replaced",
    scope: { slangDict: dict }
  });
  db.close();  
});
