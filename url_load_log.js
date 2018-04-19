var express = require('express');
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var app = express();


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

var db;
const port = 1300;

// Initialize connection once
MongoClient.connect("mongodb://192.168.39.82:27017/eturllog", function(err, database) {
  if(err) return console.error(err);
  db = database;
  console.log('In Connect');
  // the Mongo driver recommends starting the server here because most apps *should* fail to start if they have no DB.  If yours is the exception, move the server startup elsewhere. 
});


app.get("/url/log", (req, res) => {
  var response = '', reqData = req.query;
  // console.log('db', db);

  var data = {
      server: extractHostname(decodeURIComponent(reqData.url)),
      url: decodeURIComponent(reqData.url),
      loadTime: parseFloat(reqData.loadTime),
      serverResponseTime: parseFloat(reqData.serverResponseTime),
      emailid: reqData.emailid,
      createdOn: new Date()
  };

  db.collection("urls").insert(data, {upsert:true}, function (err, result) {
       if (err){
          console.log(err);
       }else{
          prepareOutput(res, reqData, {"searchResult":"SUCCESS"});
       }
    });
});

app.get("/url/log/show", (req, res) => {
  var response = '', reqData = req.query;
  var query = {};

  db.collection("urls").aggregate([{
            "$group": {
                "_id": "$url",
                // "finalTotal": { $sum: "$loadTime" },
                "Avg LoadTime" : {$avg: '$loadTime'},
                "Avg serverResponseTime" : {$avg: '$serverResponseTime'},
                "count" : {$sum: 1}
            }
        }
        ,
        { $sort: { "Avg serverResponseTime": -1} }
    ]).toArray(function(error, result){
          var finalResult = {};
          
          db.collection("urls").aggregate([{
                  "$group": {
                      "_id": "$server",
                      // "finalTotal": { $sum: "$loadTime" },
                      "Avg LoadTime" : {$avg: '$loadTime'},
                      "Avg serverResponseTime" : {$avg: '$serverResponseTime'},
                      "count" : {$sum: 1}
                  }
              },
              { $sort: { "Avg serverResponseTime": 1} }
          ]).toArray(function(error, domainResult){
              finalResult.domainResult = domainResult ? domainResult : {};
              if(reqData['all'] == 1) {
                 finalResult.result = result;
              }
              
              // prepareOutput(res, reqData, finalResult);
              res.render('log_domain.ejs', {result: finalResult.domainResult})
              // console.log("finalResult", finalResult.domainResult);
          });        
        //prepareOutput(res, reqData, {'result': result});
    });


});

app.get("/url/log/show/emailid", (req, res) => {
  var response = '', reqData = req.query;
  var query = {};

  db.collection("urls").aggregate([{
            "$group": {
                "_id": "$emailid",
                "Avg LoadTime" : {$avg: '$loadTime'},
                "Avg serverResponseTime" : {$avg: '$serverResponseTime'},
                "count" : {$sum: 1}
            }
        },
        { $sort: { "count": -1} }
    ]).toArray(function(error, result){
          var finalResult = {};
          finalResult.result = result;
          // prepareOutput(res, reqData, finalResult);
          res.render('log_emailid.ejs', {result: finalResult.result})
    });
});

app.get("/url/log/jsonp", (req, res) => {
  var response = '', reqData = req.query;
  // console.log('db', db);

  var data = {
      url: decodeURIComponent(reqData.url),
      service_url: decodeURIComponent(reqData.service_url),
      createdOn: new Date()
  };

  db.collection("jsonp").insert(data, {upsert:true}, function (err, result) {
       if (err){
          console.log(err);
       }else{
          prepareOutput(res, reqData, {"searchResult":"SUCCESS"});
       }
    });
});

app.get("/url/log/show/jsonp", (req, res) => {
  var response = '', reqData = req.query;
  var query = {};

  db.collection("jsonp").aggregate([{
            "$group": {
                "_id": "$url",
                // "finalTotal": { $sum: "$loadTime" },
                "service_url" : {"$push": "$service_url"}, 
                "count" : {$sum: 1}
            }

        },
        { $sort: { "count": -1} }

    ]).toArray(function(error, result){
          // prepareOutput(res, reqData, result);
          res.render('log_jsonp.ejs', {result: result})
    });

});


function prepareOutput (res, reqData, data) {
  data = JSON.stringify(data);
    res.setHeader('Content-Type', 'application/json');
  if(typeof reqData != 'undefined' && typeof reqData.callback != 'undefined') {
    data = reqData.callback + '(' + data + ')';
  }
  res.send(data);
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split("://")[0] + '://' + url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    //hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}


var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})

console.log("Listening on port " + port);




