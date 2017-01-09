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

var getFilterFields = function (filter) {

    if (!filter) return {};

    var filters = {}, fieldNotFound = false;

    var fields = Object.keys(VideoModel.schema.paths);

    filter.split(",").forEach(function (key) {

        if (fields.indexOf(key) !== -1) {
            filters[key] = true;
        } else {
            fieldNotFound = true
        }
    });

    return fieldNotFound ? undefined : filters;
};


// routes **********************
videos.route('/')
    .get(function (req, res, next) {
        res.locals.processed = true;

        var filters = getFilterFields(req.query.filter);

        console.log(req.query.limit);

        if (!filters) {
            var err = new Error("One of the fields in the filter does not exist!");
            err.status = 400;
            next(err);
        } else {
            VideoModel
                .find({})
                .skip( req.query.offset)
                .limit(req.query.limit);
        }
    })
    .post(function (req, res, next) {
        res.locals.processed = true;
        delete req.body._id;
        delete req.body.__v;

        var video = new VideoModel(req.body);

        video.save(function (err) {
            if (!err) {
                res.status(201).json(video).end();
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
        res.locals.processed = true;

        var filters = getFilterFields(req.query.filter);

        if (!filters) {
            var err = new Error("One of the fields in the filter does not exist!");
            err.status = 400;
            next(err);
        } else {
            VideoModel.findById(req.params.id, filters, function (err, video) {
                if (!err) {
                    res.status(201).json(video).end();
                } else {
                    next(err);
                }
            });
        }
    })
    .put(function (req, res, next) {
        //res.locals.processed = true;
        if (req.params.id == req.body._id) {

            var video = {};

            Object.keys(VideoModel.schema.paths).forEach(function (key) {
                if (req.body.hasOwnProperty(key)) {
                    video[key] = req.body[key];
                } else {
                    if (VideoModel.schema.paths[key].options.default !== undefined)
                        video[key] = VideoModel.schema.paths[key].options.default;
                    else
                        video[key] = undefined;
                }
            });

            video['updatedAt'] = Date.now();

            delete video.__v;
            delete video.timestamp;

            VideoModel.findByIdAndUpdate(req.params.id, video,
                {runValidators: true, new: true},
                function (err, video) {
                    if (err) {
                        next(err);
                    } else {
                        res.status(201).json(video).end();
                    }

                });
        } else {
            var err = new Error('id of PUT resource and send JSON body are not equal ' + req.params.id + " " + req.body._id);
            err.status = codes.wrongrequest;
            next(err);
        }
    })
    .delete(function (req, res, next) {
        res.locals.processed = true;
        VideoModel.findByIdAndRemove(req.params.id, {}, function (err, item) {
            if (!err) {
                res.status(201).json(item).end();
            } else {
                next(err);
            }
        });
    })
    .patch(function (req, res, next) {
        res.locals.processed = true;
        if (req.body.id && req.params.id != req.body.id) {
            var err = new Error('id of PUT resource and send JSON body are not equal ' + req.params.id + " " + req.body.id);
            err.status = codes.wrongrequest;
            next(err);

        } else {

            delete req.body.__v;

            var options = {
                new: true,
                runValidators: true
            };

            req.body['updatedAt'] = Date.now();

            VideoModel.findByIdAndUpdate(req.params.id, req.body, options,
                function (err, item) {
                    if (!err) {
                        res.status(201).json(item).end();
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