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

// Route input without id
videos.route('/')
    .get(function (req, res, next) {
        var videos = store.select("videos");
        if (!videos) {
            res.status(204).json().end();
        } else if (videos.length > 0){
            videos = filter(videos, req.params.filter);
            res.status(200).json(videos).end();
        }
    })
    .post(function (req, res, next) {
        var err = validateSchema(req.body, false);
        if (err) {
            next(err);
        } else {
            var obj = cleanObject(req.body);
            var id = store.insert("videos", obj);
            res.status(201).json(store.select("videos", id)).end();
        }
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
        if(!video) {
            var err = new Error("video not found");
            err.status = 404;
            next(err);
        } else {
            res.status(200).json(video).end();
        }
    }) // change whole video-objekt
    .put(function (req, res, next) {

        var err = validateSchema(req.body, true);
        if (err) {
            next(err);
        } else {
            var obj = cleanObject(req.body, true);
            obj.id = req.params.id;
            try {
                store.replace("videos", req.params.id, obj);
                res.status(200).json(obj).end();
            } catch (e) {
                var err = new Error(e.message);
                err.status = 404;
                next(err);
            }
        }
    })
    .delete(function (req, res, next) {
        try {
            store.remove("videos", req.params.id);
            res.status(204);
            next();
        } catch(e) {
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



function validateSchema(body, put) {
    // TODO: Error Status ändern?

    if (body.id && !put) {
        var error = new Error("id must not be set!");
        error.status = 400;
        return error;
    } else if (!body.id && put){
        var error = new Error("id must be set for put operation!");
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
    if (body.timestamp && !put) {
        var error = new Error("timestamp must not be set!");
        error.status = 400;
        return error;
    }else if(put && (!body.timestamp || (typeof body.timestamp != "number") || (body.timestamp < 0))){
        var error = new Error("timestamp must be set and has to be a number!");
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


function cleanObject(body, put) {

    // default description setzen, falls undefined
    body.description = body.description || "";
    body.playcount = body.playcount || 0;
    body.ranking = body.ranking || 0;
    body.timestamp = body.timestamp || Date.now();

    var obj =
     {
        title: body.title,
        description: body.description,
        src: body.src,
        length: body.length,
        timestamp: body.timestamp,
        playcount: body.playcount,
        ranking: body.ranking
    };

    if(put) {
        obj.id = body.id;
    }

    return obj;
}


function filter(obj, params) {



    var filters = params.split(",");
    if (!filters.length > 0) return obj;
    if(typeof obj === "array") {
        var filterArray = [];
        obj.forEach(function(video){
            var filterObj = {};
            filters.forEach(function (filter) {
                filterObj[filter] = video[filter];
                filterArray.push(filterObj);
            });
        });

        return filterArray;
    } else {
        var filterObj = {};
        filters.forEach(function (filter) {
            filterObj[filter] = obj[filter];
        });
        return filterObj;
    }


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
