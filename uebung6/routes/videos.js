/** This module defines the routes for videos using a mongoose model
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 */
"use strict";

// modules
var express = require('express');
var logger = require('debug')('me2u5:videos');

// HTTP status codes by name
var codes = require('./http-codes');

// for bonus tasks 4 and 5
var filterHandlerCreator = require('../restapi/filter-handler-mongo');
var offsetlimitMiddleware = require('../restapi/limitoffset-middleware-mongo');

// Mongoose Model using mongoDB
var VideoModel = require('../models/video');


var videos = express.Router();

// add middleware for bonus tasks 4 and 5 to find filter and offset/limit params  for GET / and GET /:id
videos.get(['/', '/:id'], filterHandlerCreator(VideoModel.schema.paths));
videos.get('/', offsetlimitMiddleware);

// routes **********************
videos.route('/')
    .get(function(req, res, next) {
        // the additional parameters for filter and limit/skip are not needed for task 1,2,3 solution
        VideoModel.find({}, res.locals.filter, res.locals.limitskip, function(err, items) {
            if (err) {
                err.status = codes.servererror;
                return next(err);
                // with return before (or after) the next(err) we prevent that the code continues here after next(err) has finished.
                // this saves an extra else {..}
            }
            // if the collection is empty we do not send empty arrays back.
            if (items && items.length > 0) {
                res.locals.items = items;
            }
            res.locals.processed = true;
            next();
        });
    })

    .post(function(req,res,next) {
        var video = new VideoModel(req.body);
        // timestamp and default are set automatically by Mongoose Schema Validation
        video.save(function(err) {
            if (err) {
                err.status = codes.wrongrequest;
                err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);
                return next(err);
            }
            res.status(codes.created);
            res.locals.items = video;
            next();
        });
    })

    .all(function(req, res, next) {
        if (res.locals.items || res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });

videos.route('/:id')
    .get(function(req, res,next) {
        VideoModel.findById(req.params.id, function(err, item) {
            if (err) {
                err.status = codes.servererror;
                return next(err);
            }
            else if (!item) {
                err = new Error("item not found");
                err.status = codes.notfound;
                return next(err);
            }
            res.locals.items = item;
            next();
        });
    })

    .put(function(req, res,next) {
        // first check that the given element id is the same as the URL id
        if (!req.body || req.body._id !== req.params.id) {
            // the URL does not fit the given element
            var err = new Error('id of PUT resource and send JSON body are not equal ' + req.params.id + " " + req.body._id);
            err.status = codes.wrongrequest;
            next(err);
            return; // prevent node to process this function further after next() has finished.
        }
        // main difference of PUT and PATCH is that PUT expects all data in request: checked by using the schema
        var video = new VideoModel(req.body);
        VideoModel.findById(req.params.id, req.body, function (err, item) {
            // with parameter {new: true} the TweetNModel will return the new and changed object from the DB and not the old one.
            if (err) {
                err.status = codes.wrongrequest;
                return next(err);
            }
            else if (!item) {
                err = new Error("item not found");
                err.status = codes.notfound;
                return next(err);
            }
            //  optional task 3b: check that version is still accurate
            else if (video.updatedAt.getTime() !== new Date(item.updatedAt).getTime()) {
                err = new Error("updatedAt outdated. Meanwhile update on item happened. Please GET resource again");
                err.status = codes.conflict;
                return next(err);
            }
            else if (video.__v !== item.__v) {
                err = new Error("version outdated. Meanwhile update on item happened. Please GET resource again");
                err.status = codes.conflict;
                return next(err);
            }
            // remove all fields that are not PUT-able
            delete req.body._id;
            delete req.body.__v;
            delete req.body.timestamp;
            delete req.body.updatedAt;
            // now update all fields in DB item with body data in variable video
            for (var field in VideoModel.schema.paths) {
                // this includes undefined. is important to reset attributes that are missing in req.body
                item.set(field, video[field]);
            }
            // optional task 3: update updatedAt and increase version
            item.updatedAt = new Date();
            item.increment(); // this sets __v++

            // on .save the Schema is validates, thus we don't neet to call video.validate() above to find errors.
            // All errors of incorrect incoming data occur then here
            item.save(function (err) {
                if (!err) {
                    res.locals.items = item;
                } else {
                    err.status = codes.wrongrequest;
                    err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);
                }
                next(err);
            });
        })
    })

    .patch(function(req,res,next) {
        if (!req.body || (req.body._id && req.body._id !== req.params.id)) {
            // little bit different as in PUT. :id does not need to be in data, but if the _id and url id must match
            var err = new Error('id of PATCH resource and send JSON body are not equal ' + req.params.id + " " + req.body._id);
            err.status = codes.wrongrequest;
            next(err);
            return; // prevent node to process this function further after next() has finished.
        }

        // remove (and thus ignore) version (&timestamp) in received data.
        // alternatively you could send an error back if __v or timpestamp exists.
        delete req.body.__v;
        delete req.body.timestamp;

        // optional task 3: update updatedAt manually as we do not use .save(.)
        if (req.body.updatedAt) {
            VideoModel.findOne({_id: req.body._id,
                               updatedAt: new Date(req.body.updatedAt)} // look for an object with that id and date
                            , function(err, video) {
                    if (err || !video) {
                        err = err || new Error("cannot find this element");
                        err.status = 409;
                        err.message += "; updatedAt seems outdated or does not match with id";
                        return next(err); // prevent further code of PATCH by return.
                    } else {
                        doUpdate();
                    }

                })
        }
        else {
            doUpdate();
        }

        // PATCH is easier with mongoose than PUT. You simply update by all data that comes from outside. no need to reset attributes that are missing.
        // here in function so that we can call it in if and else (task3 bonus above)
        function doUpdate() {
            req.body.updatedAt = new Date(); // set it to new value
            req.body.$inc = {__v: 1}; // this $ clause is a parameter operator for mongoose. see doku für $inc $set etc.
            VideoModel.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, item) {
                if (err) {
                    err.status = codes.wrongrequest;
                }
                else if (!item) {
                    err = new Error("item not found");
                    err.status = codes.notfound;
                }
                else {
                    res.locals.items = item;
                }
                next(err);
            })
        }

    })

    .delete(function(req,res,next) {
        VideoModel.findByIdAndRemove(req.params.id, function(err, item) {
            if (err) {
                err.status = codes.wrongrequest;
            }
            else if (!item) {
                err = new Error("item not found");
                err.status = codes.notfound;
            }
            // we don't set res.locals.items  and thus it will send a 204 (no content) at the end. see last handler video.use(..)
            res.locals.processed = true;
            next(err); // this works because err is in normal case undefined and that is the same as no parameter
        });
    })

    .all(function(req, res, next) {
        if (res.locals.items || res.locals.processed) {
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
        res.status(codes.nocontent).end(); // no content;
    }
});

module.exports = videos;