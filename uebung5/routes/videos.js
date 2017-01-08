/** This module defines the routes for videos using a mongoose model
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
var logger = require('debug')('me2u5:videos');

// TODO add here your require for your own model file

var videos = express.Router();


// initialize evil corp database
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/evilCorpMainServer');

var VideoModel = require('../models/video');

/**
 * ROUTE FOR ALL VIDEOS WITHOUT ID
 */

// routes **********************
videos.route('/')
    .get(function(req, res, next) {
        res.locals.processed = true;
        VideoModel.find({}, function (err, items) {

            // search in items (list)
            if(!err)   {
                // items in database available
                if(items.length > 0) {
                    res.status(200).json(items).end();
                } else {
                    // NO CONTENT > empty database
                    res.status(204).json().end();
                }

                // get did not work
            } else {
                err.status = 400;
                err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);
                console.log(err.errors);
                next(err);
            }
        })
    })
    .post(function(req,res,next) {
        res.locals.processed = true;
        // set new timestamp and overhand it in req.body
        req.body.timestamp = new Date().getTime();
        var video = new VideoModel(req.body);
        // save method from mongoose > save writes in database
        video.save(function (err) {
            if (!err) {
                // no error
                res.status(201).json(video).end();
            } else {
                // error > no save occured
                err.status = 400;
                err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);
                console.log(err);
                next(err);
            }

        });
    })

    // ALL > all other requests are not allowed > error output
    .all(function(req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });

/**
 * ROUTE FOR ALL VIDEOS WITH ID
 */

videos.route('/:id')
    .get(function(req, res,next) {
        res.locals.processed = true;
        // req.params.id = id in URL
        VideoModel.findById(req.params.id, function(err, video){
            if(!err) {
                    res.status(200).json(video).end();
            } else {
                err.status = 404;
                err.message = "Video with id: " + req.params.id + " does not exist.";
                next(err);
            }
        })
    })
    .put(function(req, res, next) {

        // change whole object
        res.locals.processed = true;
        var id = parseInt(req.params.id);

        VideoModel.findById(req.params.id, function (err, oldVideo) {
            if(!err) {
                req.body.timestamp = new Date().getTime();
                var newVideo = new VideoModel(req.body);
                // update video
                newVideo.save(function (err) {
                    if (!err) {
                        // no error
                        res.status(201).json(newVideo).end();
                    } else {
                        // error > no save occured
                        err.status = 400;
                        //err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);
                        next(err);
                    }
                });
            } else {
                err.status = 404;
                err.message = "Video with id: " + req.params.id + " does not exist.";
                next(err);
            }
        });
    })
    .delete(function(req,res,next) {
        res.locals.processed = true;
        var id = parseInt(req.params.id);

        VideoModel.findByIdAndRemove(req.params.id, function(err, video) {
            if(!err) {
                console.log(video);
                res.status(204).end();
            } else {
                err.status = 404;
                err.message = "Video with id: " + req.params.id + " could not be found.";
                next(err);
            }
        });

    })
    // change specificous attribute
    .patch(function(req,res,next) {
        res.locals.processed = true;
        // new True > returns a modified document
        // runValidators > Validation Schema is considered
        // setDefaultsOnInsert > will apply the default values to the ModelSchema
        VideoModel.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true, setDefaultsOnInsert: true},function(err, video) {
            if(!err) {
                res.status(200).json(video).end();
            } else {
                err.status = 406;
                err.message += "video with id: " + req.params.id + " could not be updated!";
                next(err);
            }
        })
    })

    .all(function(req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });


// this middleware function can be used, if you like or remove it
// it looks for object(s) in res.locals.items and if they exist, they are send to the client as json
videos.use(function(req, res, next){
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