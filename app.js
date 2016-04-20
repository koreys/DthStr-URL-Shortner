"use strict";
var express = require('express');
var bodyParser = require('body-parser');
var apiRoute = require('./routes/api');
var colors = require('colors');

var app = express();

var port = process.env.PORT || 8080;
var jsonParser = bodyParser.json();
var urlEncodeParser = bodyParser.urlencoded({ extended:false });

app.use(express.static(__dirname + '/pub'));

app.use("/", function(req, res, next){
    console.log(`Request URL: ${req.url}`.blue.underline);
    next();
});

apiRoute(app);

app.listen(port);
