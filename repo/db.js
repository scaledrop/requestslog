var MongoClient = require('mongodb').MongoClient;
const config = require('./config.js');


var state = {
  db: null,
  collection: null,
}

exports.connect = function(done) {
  if (state.db) return done()

  MongoClient.connect(config.database.path, function(err, database) {
    if (err) return done(err)
    state.db = database.db(config.database.name);
	  state.collection = state.db.collection(config.database.collection);
		console.log('connection done');
    done();
  })
}

exports.get = function() {
  return state.db;
}
exports.collection = function() {
  return state.collection;
}

exports.otherCollection = function (collection) {
  return state.db.collection(collection);
}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null;
      state.collection = null;
      state.mode = null;
      done(err);
    })
  }
}