var express = require('express');
var app = express();
var path = require('path');
var request = require('request');
var mongo = require('mongodb');
var monk = require('monk');
var http = require('http');
var proxy = require('express-http-proxy');

var db = monk('127.0.0.1:27017/cache');

var fs = require('fs');

var masterList = [];
var geoList = [];

app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use(express.static(__dirname + '/',{ maxAge: 1000 }));

var bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
    extended: true
}));

/// New hostname+path as specified by question:
var apiProxy = proxy('general.bigmech.ndexbio.org:5603/directedpath/query', {
    forwardPath: function (req, res) {
        return require('url').parse(req.originalUrl).path;
    }
});

/*/ New hostname+path as specified by question:
var apiProxy = proxy('localhost:5603/directedpath/query', {
    forwardPath: function (req, res) {
        return require('url').parse(req.originalUrl).path;
    }
});*/

app.get('/getMessage/:myMessage', function(req, res) {
 var myMessage = req.params.myMessage;
 res.send(myMessage);
});

console.log("Ready...");

app.use("/directedpath/*", apiProxy);

app.listen(3000)
