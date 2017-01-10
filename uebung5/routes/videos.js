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
// connect DB, create if not exists
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
                // chaining
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
        //req.body.timestamp = Date.now();
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
            err.status = 405;
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

            // new VideoModel with default values
            var video = new VideoModel(req.body);

            // call Validator
            var error = video.validateSync();

            // delete new created __v
            delete video['__v'];
            // delete id > should never be changed/overwritten
            delete video['_id'];
            // delete new created timestamp
            delete video['timestamp'];

            // setting updatedAt to the current timestamp
            video['updatedAt'] = Date.now();

            if (error) {
                error.status = 400;
                error.message += ' in fields: ' + Object.getOwnPropertyNames(error.errors);
                next(error);
            } else {
                /**
                 * PUT METHOD with Validator
                 */
                VideoModel.findByIdAndUpdate(req.params.id, video,
                    // new True > to return a modified object
                    {new: true},
                    function (err, video) {
                        if (err) {
                            next(err);
                        } else {
                            if(video) {
                                // video id exists and has been updated
                                res.status(201).json(video).end();
                            } else {
                                // id does not exist
                                var err = new Error('The ID does not exist in database: ' + req.params.id);
                                err.status = 406;
                                next(err);
                            }

                        }

                    });
            }

            // REQUEST ID and BODY ID are not identical
        } else {
            var err = new Error('ID in URL and ID in body are not identical: URL:' + req.params.id + " Body: " + req.body._id);
            err.status = 406;
            next(err);
        }
    })
    .delete(function (req, res, next) {
        res.locals.processed = true;
        //var id = parseInt(req.params.id);

        VideoModel.findByIdAndRemove(req.params.id, function (err) {
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


        // check if id is set and id of URL is NOT identical with body id > error
        if (req.body._id && req.params.id !== req.body._id) {
            var err = new Error('ID in URL and ID in body are not identical: URL:' + req.params.id + " Body: " + req.body._id);
            err.status = 406;
            next(err);

            // id is not set OR id is set and they are identical
        } else {

            // save controller flags in options object
            var options = {
                new: true,
                runValidators: true
            };

            // delete new created __v, should never be changed/overwrittes
            delete req.body['__v'];
            // delete id > should never be changed/overwritten
            delete req.body['_id'];
            // delete timestamp to guarantee that noone can change it
            delete req.body['timestamp'];
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
        }
    })

    .all(function (req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = 405;
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