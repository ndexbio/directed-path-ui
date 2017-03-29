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
        return require('url').parse(req.originalUrl).path;
    },
    decorateRequest: function(proxyReq, originalReq) {
        proxyReq.headers['Content-Type'] = 'application/json';
        proxyReq.headers['Transfer-Encoding'] = 'gzip';
        return proxyReq;
    }
});

var nodeIdsProxy = proxy('public.ndexbio.org/network/networkid/aspect/nodes', {
    forwardPath: function (req, res) {
        console.log(req.originalUrl);
        return require('url').parse(req.originalUrl).path;
    },
    decorateRequest: function(proxyReq, originalReq) {
        console.log("proxy aspects");
        proxyReq.headers['Content-Type'] = 'application/json';
        return proxyReq;
    }
});

var uuidSearchProxy = proxy('public.ndexbio.org/search/network', {
    forwardPath: function (req, res) {

        console.log(req);//.originalUrl);
        return require('url').parse(req.originalUrl).path;
    },
    decorateRequest: function(proxyReq, originalReq) {
        console.log("proxy search uuid");
        proxyReq.headers['Content-Type'] = 'application/json';
        proxyReq.method = 'POST';
        proxyReq.bodyContent = {"searchString": "RAS1"};
        return proxyReq;
    }
});

//public.ndexbio.org/v2/search/network?start=0&size=20

//public.ndexbio.org/v2/network/073b9f25-6194-11e5-8ac5-06603eb7f303/aspect/nodes?size=5000

app.get('/getMessage/:myMessage', function(req, res) {
 var myMessage = req.params.myMessage;
 res.send(myMessage);
});

console.log("Ready...");

app.use("/directedpath/*", apiProxy);

app.use("/v2/network/*", nodeIdsProxy);

app.use("/v2/search/*", uuidSearchProxy);


app.listen(3000)
