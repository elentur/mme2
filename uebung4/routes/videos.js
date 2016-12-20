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
var Optimizer = require('../utils/optimizer');
var Validator = require('../utils/validator');
var Search = require('../utils/search');

var videos = express.Router();


// routes **********************

// Route input without id
videos.route('/')
    .get(function (req, res, next) {
        var videos = store.select("videos");
        if (!videos) {
            res.status(204).json().end();
        } else if (videos.length > 0) {
            // Searching einbinden!
            // except ist blacklist > werte die nicht durchsucht werden sollen
            var except = ['filter', 'offset', 'limit'];
            videos = new Search(videos, except).searching(req.query).get();
            // mit query kann man auf Werte hinter dem "?" zugreifen
            // Reihenfolge beachten!
            videos = new Optimizer(videos)
                .filter(req.query.filter)
                .offset(req.query.offset)
                .limit(req.query.limit)
                .get();
            res.status(200).json(videos).end();
        }
    })
    .post(function (req, res, next) {

        // Objekt mit internen Arrays
        // src > key
        // [...] > Name der Funktion, mit der wir das Feld kontrollieren wollen
        var rules = {
            title: ["required", "string"],
            description: ["string"],
            src: ["required", "string"],
            length: ["number", "required", "positive"],
            playcount: ["number", "positive"],
            ranking: ["number", "positive"]
        };
        // [""] und [0] hat die Länge 1
        // [] hat die Länge 0
        var params = {
            title: [],
            description: [""],
            src: [],
            length: [],
            playcount: [0],
            ranking: [0],
            timestamp: [Date.now()]
        };

        var obj = new Validator(req.body)
            .validate(rules)
            .clean(params)
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
            // Filter-Funktion für einzelnes Video anwenden
            video = new Optimizer(video)
                .filter(req.query.filter)
                .get();
            res.status(200).json(video).end();
        }
    }) // change whole video-objekt
    .put(function (req, res, next) {

        // Objekt mit internen Arrays
        // src > key
        // [...] > Name der Funktion, mit der wir das Feld kontrollieren wollen
        var rules = {
            id: ["required", "number", "positive"],
            title: ["required", "string"],
            description: ["string"],
            src: ["required", "string"],
            length: ["number", "required", "positive"],
            playcount: ["number", "positive"],
            ranking: ["number", "positive"]
        };
        // [""] und [0] hat die Länge 1
        // [] hat die Länge 0
        var params = {
            title: [],
            description: [""],
            src: [],
            length: [],
            playcount: [0],
            ranking: [0],
            timestamp: [Date.now()]
        };

        var obj = new Validator(req.body)
            .validate(rules)
            .clean(params)
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
    // Patch > nur einzelne Felder ändern
    // Bonusaufgabe: Patch einbinden mit nicht idempotentem Aufruf von playcount +1 (bei jedem Patch eins hochzählen)
    .patch(function (req, res, next) {

        // Es darf nicht mehr als ein Attribut enthalten sein, playcount muss gesetzt sein, und es muss +1 enthalten
        if (Object.keys(req.body).length > 1 || !req.body.playcount || req.body.playcount !== "+1") {
            var err = new Error("playcount is required and can only contain the value '+1'!");
            err.status = 400;
            throw err;
        }
        var video = store.select("videos", req.params.id);
        if (!video) {
            // kein video mit gesuchter id gefunden
            var err = new Error("no video found with requested id");
            err.status = 404;
            throw err;
        }
        video.playcount++;
        try {
            store.replace("videos", req.params.id, video);
            res.status(200).json(video).end();
        } catch (e) {
            var err = new Error(e.message);
            err.status = 404;
            throw err;
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
