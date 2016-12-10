var express = require('express');
var app     = express();
var path    = require('path');
var request = require("request");
var fs 		= require('fs');
var time 	= new Date();
var day 	= time.getDate();
var month 	= time.getMonth() + 1;
var year 	= time.getFullYear();
var date	= day + "_" + month + "_" + year;

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/index.html'));
});

app.get('/user', function(req, res) {
	res.sendFile(path.join(__dirname + '/templates/error.html'))
});

app.get('/commands', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/commands.html'));
});

app.get('/songlist', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/songlist.html'));
});

app.get('/history/:id' + date, function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/history.html'));
});


console.log("Started website")

app.listen(3000);