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


/**
 * Checks if a filter was set and puts it in a Obj. If a field in the filter no correspondence to the database field
 * undefined will be returned
 * @param filter
 * @return {*}
 */
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

        if (!filters) {
            var err = new Error("One of the fields in the filter does not exist!");
            err.status = 400;
            next(err);
        } else {

            // TODO test test test

            var limit = (req.query.limit && req.query.limit > 0 ) ? parseInt(req.query.limit) : 0;
            var offset = (req.query.offset && req.query.offset > 0 ) ? parseInt(req.query.offset) : 0;

            // {} > search in all items
            VideoModel.find({}, filters) // seaching with filter
                .limit(limit) // sets limit if exists
                .skip(offset) // sets offset if exists
                .exec(function (err, items) { // executes the db query

                    // search in items (list)
                    if (!err) {
                        // items in database available
                        if (items.length > 0) {
                            res.status(200).json(items).end();
                        } else {
                            // NO CONTENT > empty database
                            res.status(204).json().end();
                        }

                        // get did not work
                    } else {
                        err.status = 400;
                        next(err);
                    }
                });
        }

    })
    .post(function (req, res, next) {
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

/**
 * ROUTE FOR ALL VIDEOS WITH ID
 */

videos.route('/:id')
    .get(function (req, res, next) {
        res.locals.processed = true;

        var filters = getFilterFields(req.query.filter);

        if (!filters) {
            var err = new Error("One of the fields in the filter does not exist!");
            err.status = 400;
            next(err);
        } else {
            // req.params.id = id in URL
            VideoModel.findById(req.params.id, filters, function (err, video) {
                if (!err) {
                    res.status(200).json(video).end();
                } else {
                    err.status = 404;
                    err.message = "Video with id: " + req.params.id + " does not exist.";
                    next(err);
                }
            });
        }
    })
    .put(function (req, res, next) {

        // change whole object
        // ID must be set in body part
        res.locals.processed = true;

        // check if id of URL is identical with body id
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

            // TODO checking, if updatedAt in the body is the same as in our DB

            // setting updatedAt to the current timestamp
            video['updatedAt'] = Date.now();

            // we don't want overwrite this fields
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
        var id = parseInt(req.params.id);

        VideoModel.findByIdAndRemove(req.params.id, function (err, video) {
            if (!err) {
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
    .patch(function (req, res, next) {
        res.locals.processed = true;
        // new True > returns a modified document
        // runValidators > Validation Schema is considered
        // setDefaultsOnInsert > will apply the default values to the ModelSchema


        var options = {
            new: true,
            runValidators: true
        };

        // setting updatedAt to the current timestamp
        req.body['updatedAt'] = Date.now();

        VideoModel.findByIdAndUpdate(req.params.id, req.body, options, function (err, video) {
            if (!err) {
                res.status(200).json(video).end();
            } else {
                err.status = 406;
                err.message += "video with id: " + req.params.id + " could not be updated!";
                next(err);
            }
        })
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