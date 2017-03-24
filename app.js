var express = require('express');
var app = express();
var path = require('path');
var request = require('request');
var http = require('http');
var proxy = require('express-http-proxy');

var fs = require('fs');

var masterList = [];
var geoList = [];

app.use(express.static(__dirname + '/',{ maxAge: 1000 }));

var bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
    extended: true
}));

//var apiProxy = proxy('localhost:5603/directedpath/query', {
var apiProxy = proxy('general.bigmech.ndexbio.org:5603/directedpath/query', {
    forwardPath: function (req, res) {
        console.log(req.originalUrl);
        return require('url').parse(req.originalUrl).path;
    },
    decorateRequest: function(proxyReq, originalReq) {
        // you can update headers
        proxyReq.headers['Content-Type'] = 'application/json';
        proxyReq.headers['Transfer-Encoding'] = 'gzip';

        return proxyReq;
    }
});

/*proxy('www.google.com', {
  decorateRequest: function(proxyReq, originalReq) {
    // you can update headers
    proxyReq.headers['Content-Type'] = 'text/html';
    // you can change the method
    proxyReq.method = 'GET';
    // you can munge the bodyContent.
    proxyReq.bodyContent = proxyReq.bodyContent.replace(/losing/, 'winning!');
    return proxyReq;
  }
})*/


app.get('/getMessage/:myMessage', function(req, res) {
 var myMessage = req.params.myMessage;
 res.send(myMessage);
});

app.post('/xdirectedpath/query', function(req, resp) {
    var query = req.query;
    var returnData = "";

    console.log(query.source);
    console.log(query.target);
    console.log(query.pathnum);
    console.log(query.uuid);
    console.log(query.server);

    var querystring = "?source=" + query.source + "&target=" + query.target + "&pathnum=" + query.pathnum + "&uuid=" + query.uuid + "&server=" + query.server;



    var extServerOptionsPost = {
        host: 'general.bigmech.ndexbio.org',
        port: '5603',
        path: '/directedpath/query' + querystring,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Transfer-Encoding': 'gzip'
        }
    };

    //6
    var reqPost = http.request(extServerOptionsPost, function (res) {
        console.log("response statusCode: ", res.statusCode);
        res.on('data', function (data) {
            returnData += data;
            process.stdout.write(data);
        });
    });

    // 7
    //reqPost.write(employee);
    reqPost.end();
    reqPost.on('error', function (e) {
        console.error(e);
    });

    //resp.send(JSON.stringify({"data": docs[0]["data"]});

});



console.log("Ready...");

app.use("/directedpath/*", apiProxy);


app.listen(3000)
