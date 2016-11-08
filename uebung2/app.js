/**
 * @author Marcus Bätz, Robert Dziuba & Inga Schwarze
 * @description out first nodejs server with a "hello world" output
 *
 */

// use ECMA Script 5
"use strict";

// load express - framework loaded
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var text = undefined;

// add route to static files
// dirname > path
// redirect all requests which contain "public" to the directory "static"
app.use("/public", express.static(path.join(__dirname, 'static')));


/**
 * localhost:3000/time shows actual system time as plain text
 * "text/html" would show time as html text (default)
 */
app.get('/time', function (req, res) {

    res.contentType("text/plain");

    var currentdate = new Date();
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();

    res.send(datetime);
});


/**
 * localhost:3000/file.txt shows content of file.txt and time (in ns) the server takes for loading asynchronously.
 *
 */
app.get('/file.txt', function (req, res) {
    var time = process.hrtime();
    if (text === undefined) {
        fs.readFile("file.txt", "utf8", function (err, contents) {
            var diff = process.hrtime(time);
            res.contentType("text/plain");
            text = contents;
            console.log("test");

            res.send('in ' + diff + ' Nanosekunden\n\n' + text);

        });
    } else {
        var diff = process.hrtime(time);
        res.send('in ' + diff + ' Nanosekunden\n\n' + text);
    }

});


/**
 * get needs parameter "/*" to ensure that every invocation of localhost/3000 concatenated with any
 * characters gives back the hello world output
 * this function has to be at the bottom of this js file because the regular expression "*" catches all request
 * should only be parsed if all other requests are not parsed
 */
app.get('/*', function (req, res) {

    res.send('<!DOCTYPE html>' +
        '<html lang="en">' +
        '<head><meta chatset="utf8"></head>' +
        '<body><h1>Hello World!</h1></body>' +
        '</html>');
});

// start server, output only in console now
var server = app.listen(3000, function () {
    console.log('helloworld app is ready and listening at http://localhost:3000');
});