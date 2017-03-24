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
        // Update headers
        proxyReq.headers['Content-Type'] = 'application/json';
        proxyReq.headers['Transfer-Encoding'] = 'gzip';

        return proxyReq;
    }
});

app.get('/getMessage/:myMessage', function(req, res) {
 var myMessage = req.params.myMessage;
 res.send(myMessage);
});

console.log("Ready...");

app.use("/directedpath/*", apiProxy);


app.listen(3000)
