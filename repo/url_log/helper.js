// var o2x = require('object-to-xml');
const fs = require('fs');

var counter = {};

exports.logger = function(req, res, next) {
	var u = req._parsedUrl.pathname;
    if(u.indexOf('showlog') == -1){
    	var date = new Date();
	    var h = date.getFullYear() + "-"+ (date.getMonth()+1) + "-"+ date.getDate() + ":"+ date.getMinutes();
	    if(typeof counter[h] != "undefined" && typeof counter[h][u] != "undefined"){
	    	counter[h][u]++;
	    }else{
	    	if(typeof counter[h] == 'undefined') {
	    		counter[h] = {};
	    	}
	    	counter[h][u] = 1;
	    }
    }
    // accept all the valid callbacks only
    var allowed = /^[A-Za-z0-9_.]+$/; // only 'A-Z', 'a-z', '0-9', '_' , and '.'' 
    if(allowed.test(req.query.callback)){
    	next(); // Passing the request to the next handler in the stack.
    }else{
    	console.log("invalid characters passed in callback", req.query.callback);
    }
}

exports.getCount = function() {
	return counter;
}
exports.NumberLong = function(num) {
	num = parseInt(num);
	num = isNaN(num) ? 0 : num;
	return num;
}

exports.prepareOutput = function(res, reqData, data, outputType) {
	if(outputType == 'xml') {
		data = json2xml(data);
		res.header('Content-Type','text/xml').send(data);
	} else {
		data = JSON.stringify(data);
		if(reqData.callback) {
			data = reqData.callback + '(' + data + ')';
		}
	  	res.setHeader('Content-Type', 'application/json');
	  	res.send(data);
	}
}

exports.preparePostOutput = function(res, reqData, data) {
	data = JSON.stringify(data);
	res.setHeader('Content-Type', 'text/html');
	if(reqData.callback) {
		data = reqData.callback + '(' + data + ')';
		data = "<script>var hdomain='indiatimes.com'; if (document.domain != hdomain) {if ((document.domain.indexOf(hdomain)) != -1) {document.domain = hdomain}}" + data + "</script>";
	}
	res.send(data);
	res.end();
}

exports.extractHostname = (url) => {
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
/*
json2xml = function(json) {
	var obj = { '?xml version=\"1.0\" encoding=\"iso-8859-1\"?' : null, request : json };
	return o2x(obj);
}

exports.json2xml = json2xml;*/


exports.getFile = function(file) {
	let rawdata = fs.readFileSync(file);
	return rawdata;
}

exports.getWidgets = function() {
	let rawdata = fs.readFileSync('widgets.json');
	let widgetJson = JSON.parse(rawdata);
	return widgetJson;
}
