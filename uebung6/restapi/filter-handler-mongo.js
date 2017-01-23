/** This module defines a express.Router() instance
 * - supporting filter=key1,key2
 * - it sets res.locals.filter to a string "key1 key2"
 * - calls next with error if a filter=key is given, but key does not exist (not raised on empty item arrays!)
 *
 *  Note: it expects to be called before any data is fetched from DB
 *  Note: it sets an Error-Object to next with error.status set to HTTP status code 400
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module restapi/filter-middleware-mongo
 * @type {Factory function returning an Router}
 * @param Schema {Object} a MongooseSchema.path value or similar object with attributes representing the valid keys
 * @param suppressId {Boolean} if true, the _id is not returned implicitly
 */
"use strict";

var express = require('express');
var logger = require('debug')('me2:filterware');

/**
 * private helper function to filter Objects by given keys
 *
 * @param keys {Array} the keys from GET parameter filter
 * @param schema [Object} containing the keys as attributes that are allowed
 * @returns {Object or Error} either the filtered items or an Error object
 */
var limitFilterToSchema = function(keys, schema) {
    if (!keys || !schema) {  // empty arrays evaluate to false
      return undefined; // means no filter at all
    }

    var error = null;
    var result = [];
    // now for each given filter=key1,key2 in the array check that the schema allows this key and store it in result
    keys.forEach(function(key) {
        if (schema.hasOwnProperty(key)) {
            result.push(key);
        } else {
            error = new Error('given key for filter does not exist in ressource: '+ key);
        }
    });
    return error ? error: result
};

/**
 * closure function as factory returning the  router
 *
 * @param Schema {Object} a MongooseSchema.path value or similar object with attributes representing the valid keys
 * @param suppressId {Boolean} if true, the _id is not returned implicitly
 * @returns {Router}
  */

var createFilterRouter = function createFilterRouter(schema, supressID) {
    var router = express.Router();
    // the exported router with handler
    router.use(function (req, res, next) {
        var filterString = req.query.filter;
        var filterKeys = [];
        var err = null;

        if (filterString !== undefined) {
            filterKeys = filterString.split(',');
            filterKeys.forEach(function (item, index, array) {
                array[index] = item.trim();
            });
            filterKeys = filterKeys.filter(function (item) {
                return item.length > 0;
            });
            if (filterKeys.length === 0) {
                err = new Error('given filter does not contain any keys');
                err.status = 400;
            } else {
                var result = limitFilterToSchema(filterKeys, schema);
                if (result instanceof Error) {
                    err = result;
                    err.status = 400;
                } else {
                    res.locals.filter = result.join(' '); // create a string with space as seperator
                    if (supressID) {
                        res.locals.filter = '-_id '+res.locals.filter;
                    }
                }
            }
        }
        if (err) {
            logger(err);
            return next(err)
        } else {
            if (res.locals.filter) {
                logger('Successfully set filter to ' + res.locals.filter);
            }
            next()
        }
    });
    return router;
};
module.exports = createFilterRouter;