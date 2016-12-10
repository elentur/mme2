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
var Helper = require('../util/helper');
var Validator = require('../util/validator');
var Searcher = require('../util/searcher');

var videos = express.Router();

// if you like, you can use this for task 1.b:
var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};


// routes **********************

// Route input without id
videos.route('/')
    .get(function (req, res, next) {
        var videos = store.select("videos");
        if (!videos) {
            res.status(204).json().end();
        } else if (videos.length > 0) {

            videos = new Searcher(videos,['filter','offset','limit'])
                .searchTerms(req.query)
                .get();

            videos = new Helper(videos)
                .filter(req.query.filter)
                .offset(req.query.offset)
                .limit(req.query.limit)
                .get();

            res.status(200).json(videos).end();
        }
    })
    .post(function (req, res, next) {


        var roules = {
            'title': "required|string",
            'description': "string",
            'src': "required|string",
            'length': "num|required|positive",
            'playcount': "num|positive",
            'ranking': "num|positive"
        };

        var defaults = {
            'title': [],
            'description': [""],
            'src': [],
            'length': [],
            'playcount': [0],
            'ranking': [0],
            'timestamp': [Date.now()]
        };

        var obj = new Validator(roules)
            .validate(req.body)
            .clean(defaults)
            .get();

        var id = store.insert("videos", obj);
        res.status(201).json(store.select("videos", id)).end();

    })
    .put(function (req, res, next) {
        var error = new Error("method is not allowed here!");
        error.status = 405;
        next(error);
    })
    .delete(function (req, res, next) {
        var error = new Error("method is not allowed here!");
        error.status = 405;
        next(error);
    });
// Route for get, put & delete for id input
videos.route('/:id')
    .get(function (req, res, next) {
        var video = store.select("videos", req.params.id);

        if (!video) {
            var err = new Error("video not found");
            err.status = 404;
            next(err);
        } else {

            video = new Helper(video)
                .filter(req.query.filter)
                .offset(req.query.offset)
                .limit(req.query.limit)
                .get();

            res.status(200).json(video).end();
        }
    }) // change whole video-objekt
    .put(function (req, res, next) {

        var roules = {
            'id': "num|required|positive",
            'title': "required|string",
            'description': "string",
            'src': "required|string",
            'length': "num|required|positive",
            'playcount': "num|positive",
            'ranking': "num|positive"
        };

        var defaults = {
            'title': [],
            'description': [""],
            'src': [],
            'length': [],
            'playcount': [0],
            'ranking': [0],
            'timestamp': [Date.now()]
        };


        var obj = new Validator(roules)
            .validate(req.body)
            .clean(defaults)
            .get();

        try {
            store.replace("videos", req.params.id, obj);
            res.status(200).json(obj).end();
        } catch (e) {
            var err = new Error(e.message);
            err.status = 404;
            next(err);
        }

    })
    .delete(function (req, res, next) {
        try {
            store.remove("videos", req.params.id);
            res.status(204);
            next();
        } catch (e) {
            var err = new Error("no video found with requested id");
            err.status = 404;
            next(err);
        }
    })
    .post(function (req, res, next) {
        var error = new Error("method is not allowed here!");
        error.status = 405;
        next(error);
    });

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
