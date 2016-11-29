/** This module defines the routes for videos using the store.js as db memory
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)

// modules
var express = require('express');
var logger = require('debug')('me2u4:videos');
var store = require('../blackbox/store');

var videos = express.Router();

// if you like, you can use this for task 1.b:
var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};


// routes **********************

videos.route('/')
    .get(function (req, res, next) {
        res.status(200).json(store.select("videos"));
        next();
    })
    .post(function (req, res, next) {


        var err = validateSchema(req.body);
        if (err) {
            next(err);
        } else {
            var obj = cleanObject(req.body);
            var id = store.insert("videos", obj);
            res.status(201).json(store.select("videos", id));
            next();
        }



    });
videos.route('/:id')
    .get(function (req, res, next) {

        res.status(404).json("{}");
        next();
    })
    .put(function (req, res, next) {
        // TODO
        next();
    })
    .delete(function (req, res, next) {
        // TODO
        next();
    });





function validateSchema(body) {

    // default description setzen, falls undefined
    body.description = body.description || "";
    body.playcount = body.playcount || 0;
    body.ranking = body.ranking || 0;

    if (body.id) {
        var error = new Error("id must not be set!");
        error.status = 400;
        return error;
    }
    if (!body.title || typeof body.title != "string") {
        var error = new Error("title is required and has to be a string!");
        error.status = 400;
        return error;
    }
    if (body.description && typeof body.description != "string") {
        var error = new Error("description has to be a string!");
        error.status = 400;
        return error;
    }
    if (!body.src || typeof body.src != "string") {
        var error = new Error("source is required and has to be a string!");
        error.status = 400;
        return error;
    }
    if (!body.length || typeof body.length != "number" || body.length < 0) {
        var error = new Error("length is required and has to be a positive number!");
        error.status = 400;
        return error;
    }
    if (body.timestamp) {
        var error = new Error("timestamp must not be set!");
        error.status = 400;
        return error;
    }
    if (body.playcount && (typeof body.playcount != "number" || body.playcount < 0)) {
        var error = new Error("playcount has to be a positive number!");
        error.status = 400;
        return error;
    }
    if (body.ranking && (typeof body.ranking != "number" || body.ranking < 0)) {
        var error = new Error("ranking has to be a positive number!");
        error.status = 400;
        return error;
    }

}


function cleanObject(body) {

    return {
        title: body.title,
        description: body.description,
        src: body.src,
        length: body.length,
        timestamp: Date.now(),
        playcount: body.playcount,
        ranking: body.ranking
    };

}



// this middleware function can be used, if you like (or remove it)
videos.use(function (req, res, next) {
    // if anything to send has been added to res.locals.items
    if (res.locals.items) {
        // then we send it as json and remove it
        res.json(res.locals.items);
        delete res.locals.items;
    } else {
        // otherwise we set status to no-content
        res.set('Content-Type', 'application/json');
        res.status(204).end(); // no content;
    }
});

module.exports = videos;
