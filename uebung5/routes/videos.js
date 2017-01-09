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

var videos = express.Router();


// initialize evil corp database
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/evilCorpMainServer');

var VideoModel = require('../models/video');


/**
 * function for GET request on /videos or /videos/id
 * allows to filter a get request, f.e. /videos/?filter=title,length or /videos/id/?filter=src
 *
 *
 * Checks if a filter was set and puts it in an Obj.
 * If a field in the filter has no correspondence to the database field undefined will be returned
 * @param filter
 * @return {*}
 */
var getFilterFields = function (filter) {

    // filter = URL filter string
    // no filter set > return empty object
    if (!filter) return {};

    // create empty object filters and boolean variable fieldNotFound
    var filters = {}, fieldNotFound = false;

    // save all keys of our videomodel in fields (src, length...)
    var fields = Object.keys(VideoModel.schema.paths);

    // split URL input into individual strings (comma separated)
    // run through all filters that has been set
    filter.split(",").forEach(function (key) {

        // filter string in URL found in our schema
        if (fields.indexOf(key) !== -1) {
            filters[key] = true;
        } else {
            // filter string in URL not found in schema / not existing
            fieldNotFound = true
        }
    });

    // if fieldNotFound = True > return undefined > entered filter not existing
    // if fieldNotFound = False > return entered filters (object)
    return fieldNotFound ? undefined : filters;
};

/**
 * ROUTE FOR ALL VIDEOS WITHOUT ID
 */
// routes **********************

videos.route('/')
    .get(function (req, res, next) {
        res.locals.processed = true;

        /**
         * BONUS TASK
         * FILTER on get request
         *
         */
        // save all entered filter params in URL (already seperated in function)
        var filters = getFilterFields(req.query.filter);

        // throw error message if one of the entered filter in URL does not exist!
        if (!filters) {
            var err = new Error("One of the fields in the filter does not exist!");
            err.status = 400;
            next(err);

            // all filters entered are exiting
            // get request will be executed
        } else {

            // TODO test test test

            // if limit and offset exist > return their int values, if not return 0
            var limit = (req.query.limit && req.query.limit > 0 ) ? parseInt(req.query.limit) : 0;
            var offset = (req.query.offset && req.query.offset > 0 ) ? parseInt(req.query.offset) : 0;

            /**
             * GET FUNCTION > /VIDEOS
             */
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
        // "save" method from mongoose > "save" writes in database
        video.save(function (err) {
            if (!err) {
                // no error > post was successful
                res.status(201).json(video).end();
            } else {
                // error > no save occured
                err.status = 400;
                err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);
                next(err);
            }

        });
    })

    // ALL > all other requests are not allowed > error output
    .all(function (req, res, next) {
        // res.locals.processed is true > post and get
        if (res.locals.processed) {
            next();
            // ALL other methods on /videos are not allowed
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


        /**
         * BONUS TASK
         * FILTER on get request
         *
         */

        // save all entered filter params in URL (already seperated in function)
        var filters = getFilterFields(req.query.filter);

        // throw error message if one of the entered filter in URL does not exist!
        if (!filters) {
            var err = new Error("One of the fields in the filter does not exist!");
            err.status = 400;
            next(err);

            // all filters entered are existing > execute get request
        } else {
            // req.params.id = id in URL
            VideoModel.findById(req.params.id, filters, function (err, video) {
                if (!err) {
                    // get on video with id successful
                    res.status(200).json(video).end();

                    // video with id not existing > error
                } else {
                    err.status = 404;
                    err.message = "Video with id: " + req.params.id + " does not exist.";
                    next(err);
                }
            });
        }
    })
    /**
     * PUT
     * changes whole object, ID must be set in body part in Postman
     */
    .put(function (req, res, next) {
        res.locals.processed = true;

        // check if id of URL is identical with body id
        if (req.params.id == req.body._id) {

            // create empty video object
            var video = {};

            // run through all keys of our VideoModel schema
            Object.keys(VideoModel.schema.paths).forEach(function (key) {

                // check if body has attribute that is identical with the key in our schema
                if (req.body.hasOwnProperty(key)) {
                    // save existing key and value in body part in our video object
                    video[key] = req.body[key];

                    // f.e. no title declared > undefined
                    // no ranking > default value
                    // key of out VideoModel schema is not part of body
                } else {
                    // check if there are default values and set them
                    if (VideoModel.schema.paths[key].options.default !== undefined)
                        video[key] = VideoModel.schema.paths[key].options.default;
                    // set undefined > error has to be called > could have been required field such as title
                    else
                        video[key] = undefined;
                }
            });



            // TODO checking, if updatedAt in the body is the same as in our DB

            // setting updatedAt to the current timestamp
            video['updatedAt'] = Date.now();

            // we don't want overwrite these fields
            delete video.__v;
            delete video.timestamp;

            /**
             * PUT METHOD with Validator
             */
            VideoModel.findByIdAndUpdate(req.params.id, video,
                {runValidators: true, new: true},
                function (err, video) {
                    if (err) {
                        next(err);
                    } else {
                        res.status(201).json(video).end();
                    }

                });

            // REQUEST ID and BODY ID are not identical
        } else {
            var err = new Error('id of PUT resource and send JSON body are not equal ' + req.params.id + " " + req.body._id);
            err.status = codes.wrongrequest;
            next(err);
        }
    })
    .delete(function (req, res, next) {
        res.locals.processed = true;
        //var id = parseInt(req.params.id);

        VideoModel.findByIdAndRemove(req.params.id, function (err, video) {
            if (!err) {
                // delete was successful
                res.status(204).end();

                // delete could not be executed > ID was not found!
            } else {
                err.status = 404;
                err.message = "Video with id: " + req.params.id + " could not be found.";
                next(err);
            }
        });

    })
    /**
     * PATCH
     * changes specificous attribute, not the whole object
     */
    .patch(function (req, res, next) {
        res.locals.processed = true;
        // new True > returns a modified document
        // runValidators > Validation Schema is considered
        // setDefaultsOnInsert > will apply the default values to the ModelSchema


        // save controller flags in options object
        var options = {
            new: true,
            runValidators: true
        };

        // setting updatedAt to the current timestamp
        req.body['updatedAt'] = Date.now();


        // PATCH with options object
        VideoModel.findByIdAndUpdate(req.params.id, req.body, options, function (err, video) {
            if (!err) {
                // patch was successful
                res.status(200).json(video).end();

                // patch did not work > error
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