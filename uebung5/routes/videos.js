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
var codes = require('statuses');

// TODO add here your require for your own model file

var videos = express.Router();

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/me2');
var VideoModel = require('../models/video');


// routes **********************
videos.route('/')
    .get(function (req, res, next) {

        VideoModel.find({}, function (err, items) {
            res.status(201).json(items);
        });
    })
    .post(function (req, res, next) {

        delete req.body._id;
        delete req.body.__v;

        var video = new VideoModel(req.body);

        video.save(function (err) {
            if (!err) {
                res.status(201).json(video);
            }
            else {
                /*console.log(err);
                 err.status = 400;
                 err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);*/
                next(err);
            }
        });
    })
    .all(function (req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });

videos.route('/:id')
    .get(function (req, res, next) {
        VideoModel.findById(req.params.id, function (err, video) {
            if (!err) {
                res.status(201).json(video);
            } else {
                next(err);
            }
        });
    })
    .put(function (req, res, next) {

        if (req.params.id == req.body._id) {

            VideoModel.findById(req.params.id, function (err, video) {
                if (err) {
                    next(err);
                } else {

                    console.log(video);

                    if (video) {

                        Object.keys(VideoModel.schema.paths).forEach(function (key) {
                            video[key] = req.body[key];
                        });

                        delete req.body._id;
                        delete req.body.__v;

                        var newVideo = new VideoModel(video);

                        newVideo.save(function (err) {
                            if (err) {
                                next(err);
                            } else {
                                res.status(201).json(newVideo);
                            }
                        });
                    }else{
                        var err = new Error('No video found with id ' + req.params.id);
                        err.status = 401;
                        next(err);
                    }
                }
            });
        } else {
            var err = new Error('id of PUT resource and send JSON body are not equal ' + req.params.id + " " + req.body._id);
            err.status = codes.wrongrequest;
            next(err);
        }
    })
    .delete(function (req, res, next) {
        VideoModel.findByIdAndRemove(req.params.id,
            function (err, item) {
                if (!err) {
                    res.status(201).json(item);
                } else {
                    next(err);
                }
            });
    })
    .patch(function (req, res, next) {
        if (req.body.id && req.params.id != req.body.id) {
            var err = new Error('id of PUT resource and send JSON body are not equal ' + req.params.id + " " + req.body.id);
            err.status = codes.wrongrequest;
            next(err);

        } else {

            delete req.body._id;
            delete req.body.__v;

            VideoModel.findByIdAndUpdate(req.params.id, req.body, {new: true},
                function (err, item) {
                    if (!err) {
                        res.status(201).json(item);
                    } else {
                        next(err);
                    }
                });
        }
    })

    .all(function (req, res, next) {
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