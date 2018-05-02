
# Requests load log

Measure your server's response. it is based on browser's native **Performance Api**. Store request logs in any preferred db storage, but we've used MongoDB here.


## Install
    npm install

## Usage

 1. Open ***config.js***, edit your appPort, db.path, db.collection settings here.
 2. `npm start`
 3. Open ***{path}/client-side/index.html*** in your browser and check the Network whether it's making the get requests to the ***{path}/url/log***. Feel free to to embed this ajax request on your desired page.
 4. See the logs on the ***{path}/url/log/show/***
 5. Additional: If you've multiple users then you could check out their aggregated load time on ***{path}/url/log/show/emailid***

Note: {path} above denotes where your app is running, 8080 is default.

## Example
Please use the below code anywhere you wish to test performance.
```javascript
var base_url = '/url/log',

// calculate load time and server load time
loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
loadTime = (loadTime / 1000).toFixed(2),
serverResponseTime = window.performance.timing.responseStart - window.performance.timing.requestStart;
serverResponseTime = (serverResponseTime / 1000).toFixed(2);

var emailid = 'test@example.com', // current user's id. Note: It is for tracking multiple user's machine and aggregate the laod time accordingly, you are free to take any other field instead of emailid;

data = {
	url: (window.location.origin + window.location.pathname),
	loadTime: loadTime,
	serverResponseTime: serverResponseTime,
	emailid: emailid
};

// Initiate a request from the page
ajax.get(base_url, data, function (data) {
	console.log("data", data);
});
```
## License
This work is under [MIT Open Source license](https://opensource.org/licenses/MIT).
