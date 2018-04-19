var express = require('express');
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const config = require('./config.js');
const db = require('./db.js');
const helper = require('./helper.js');
const appModule = require('./module.js');

app.set('view engine', 'ejs');

var collection = '';
db.connect(function () {
	collection = db.collection();
});

app.all("*", (req, res, next) => {
	var data = {
		url: req.protocol + '://' + req.get('host') + req.originalUrl,
		data: Object.keys(req.body).length ? req.body : req.query
	}
	appModule.saveData({
		db: db, 
		data: data, 
		collection: 'request_log'
	}, result => {
		helper.logger(req, res, next);
	});
});
app.use(express.static(__dirname + '/public')); // placed here to override the all requsts

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON Format');
  }
});

app.get('/', (req, res) => {
	res.send('working app..');
});

app.get("/url/log", (req, res) => {
  var response = '', reqData = req.query;
  var data = {
      server: helper.extractHostname(decodeURIComponent(reqData.url)),
      url: decodeURIComponent(reqData.url),
      loadTime: parseFloat(reqData.loadTime),
      serverResponseTime: parseFloat(reqData.serverResponseTime),
      emailid: reqData.emailid,
      createdOn: new Date()
  };
  	appModule.saveData({
		db:db, 
		data: data
	}, function(result) {
		helper.preparePostOutput(res, reqData, {"searchResult":"SUCCESS"});
	});
});

app.get("/url/log/show*", (req, res) => {
		var response = '', reqData = req.query;
		var u = req._parsedUrl.pathname, 
		groupOn = "$server", 
		template = 'log_domain.ejs',
		sort = { "Avg serverResponseTime": 1};
		if(u.indexOf('emailid') != -1){
			groupOn = "$emailid";
			template = 'log_emailid.ejs';
			sort = { "count": -1};
		}
	  var query = [{
	          "$group": {
	              "_id": groupOn,
	              // "finalTotal": { $sum: "$loadTime" },
	              "Avg LoadTime" : {$avg: '$loadTime'},
	              "Avg serverResponseTime" : {$avg: '$serverResponseTime'},
	              "count" : {$sum: 1}
	          }
	      },
	      { $sort: sort }
	  ];
		appModule.aggregate({
			db:db, 
			query: query
		  }, function(domainResult) {
				var finalResult = {};
				finalResult.domainResult = domainResult ? domainResult : {};
	          	res.render(template, {result: finalResult.domainResult})
		})
});

app.get('/logerror', (req, res) => {
	var response = '', reqData = req.query;
	  var data = {
	      server: helper.extractHostname(decodeURIComponent(reqData.url)),
	      url: decodeURIComponent(reqData.url),
	      loadTime: parseFloat(reqData.loadTime),
	      serverResponseTime: parseFloat(reqData.serverResponseTime),
	      emailid: reqData.emailid,
	      createdOn: new Date()
	  };
  	appModule.saveData({
		db:db, 
		data: data
	}, function(result) {
		helper.preparePostOutput(res, reqData, {"searchResult":"SUCCESS"});
	});
})

// And start the server

var server = app.listen(config.appPort, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log("app listening at http://%s:%s", host, port);
});

server.timeout = config.serverTimeout;




