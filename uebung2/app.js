/**
 * Created by Inga Schwarze on 25.10.2016.
 */

"use strict";

var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

// add route to static files
app.use("/public", express.static(path.join(__dirname, 'static')));

app.get('/', function (req, res) {

    res.send('<!DOCTYPE html>' +
            '<html lang="en">' +
            '<head><meta chatset="utf8"></head>' +
            '<body><h1>Hello World!</h1></body>' +
            '</html>');
});

app.get('/time', function (req, res) {

    res.contentType("text/plain");

    var currentdate = new Date();
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
        + (currentdate.getMonth()+1)  + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();

    res.send(datetime);
});

app.get('/file.txt', function (req, res) {
    var starttime = new Date().getTime();
    var endtime;
    fs.readFile("file.txt", "utf8", function (err, contents) {
        endtime = new Date().getTime();
        var timediff = endtime - starttime;
        res.contentType("text/plain");
        res.send(contents + ' \nin ' + timediff + ' Nanosekunden');

    })
});


// start server
var server = app.listen(3000, function () {
    console.log('helloworld app is ready and listening at http://localhost:3000');
});