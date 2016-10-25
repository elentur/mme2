/**
 * Created by Inga Schwarze on 25.10.2016.
 */

"use strict";

var express = require('express');
var path = require('path');

var app = express();

// add route to static files
app.use(express.static(path.join(__dirname, 'public')));

/*app.get('/', function (req, res) {

    res.send('<!DOCTYPE html>' +
            '<html lang="en">' +
            '<head><meta chatset="utf8"></head>' +
            '<body><h1>Hello World!</h1></body>' +
            '</html>');
});*/

// start server
var server = app.listen(3000, function () {
    console.log('helloworld app is ready and listening at http://localhost:3000');
});