/** Main app for server to start a small REST API for tweets
 * The included ./blackbox/store.js gives you access to a "database" which contains
 * already tweets with id 101 and 102, as well as users with id 103 and 104.
 * On each restart the db will be reset (it is only in memory).
 * Best start with GET http://localhost:3000/tweets to see the JSON for it
 *
 * TODO: Start the server and play a little with Postman
 * TODO: Look at the Routes-section (starting line 68) and start there to add your code
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";  // tell node.js to be more "strict" in JavaScript parsing (e.g. not allow variables without var before)

// node module imports
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

// our own modules imports
var store = require('./blackbox/store.js');

// creating the server application
var app = express();


// Middleware ************************************
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// logging
app.use(function (req, res, next) {
    console.log('Request of type ' + req.method + ' to URL ' + req.originalUrl);
    next();
});

// API-Version control. We use HTTP Header field Accept-Version instead of URL-part /v1/
app.use(function (req, res, next) {
    // expect the Accept-Version header to be NOT set or being 1.0
    var versionWanted = req.get('Accept-Version');
    if (versionWanted !== undefined && versionWanted !== '1.0') {
        // 406 Accept-* header cannot be fulfilled.
        res.status(406).send('Accept-Version cannot be fulfilled').end();
    } else {
        next(); // all OK, call next handler
    }
});

// request type application/json check
app.use(function (req, res, next) {
    if (['POST', 'PUT'].indexOf(req.method) > -1 && !( /application\/json/.test(req.get('Content-Type')) )) {
        // send error code 415: unsupported media type
        res.status(415).send('wrong Content-Type');  // user has SEND the wrong type
    } else if (!req.accepts('json')) {
        // send 406 that response will be application/json and request does not support it by now as answer
        // user has REQUESTED the wrong type
        res.status(406).send('response of application/json only supported, please accept this');
    }
    else {
        next(); // let this request pass through as it is OK
    }
});


// Routes ***************************************

/**
 * TWEETS
 */
app.get('/tweets', function (req, res, next) {

    // used for tweets, users, likes >
    // combinedRessource is defined > likes
    getRessources(res,req,"tweets","likes");
});

app.post('/tweets', function (req, res, next) {
    push(res,req,"tweets");
});

// Create Route for tweets
routing(app.route('/tweets/:id'), "tweets", "likes");


/**
 * USER
 */

app.get('/users', function (req, res, next) {
    // combinedRessouce is undefined > no setCombinedRessource
    getRessources(res,req,"users");
});

app.post('/users', function (req, res, next) {
    push(res,req,"users");
});
// Create Route for users
routing(app.route('/users/:id'), "users");


/**
 * LIKES: our own ressource route with handler functions
 *
 * Represents REST Level 2
 * --- different operation for different requests > different URL's
 * --- concept of navigation with ressource URLs and manipulation by HTTP methods
 *
 */
// getRessources all likes
app.get('/likes', function (req, res, next) {
    getRessources(res,req,"likes");
});
// create new like > id not existing yet > add
app.post('/likes', function (req, res, next) {
    push(res,req,"likes");
});
// Create Route for likes
routing(app.route('/likes/:id'), "likes");

/**
 * Routing organizes all entity calls
 * avoid syntax mistakes
 * for get, delete and put (not push, because it needs list)
 * @param route the route object returned from app.route()
 * @param ressource the subaddress where route routes to as string
 * @param combineRessource if the return value should be expanded or not
 */
// for all requests that contain /id
function routing(route, ressource, combineRessource) {
    // default control > cancle method
    if (route === null || ressource === null) return;
    route.get(function (req, res, next) {

        // obj captures one elemenet, f.E. tweet with id 101
        var obj = store.select(ressource, req.params.id);

        // check if combinedRessource is available > set combinedRessource
        if (combineRessource !== undefined) setCombinedRessource(obj, combineRessource, req);

        // f.E. set href for single tweet_id
        obj = hrefMaker(obj, req, ressource, obj.id + ((req.query.expand) ? "?expand=" + req.query.expand : ""));
        res.json(obj);
    }) // delete > objects can only be deleted seperately
        .delete(function (req, res, next) {
            store.remove(ressource, req.params.id);
            res.status(200).end();
        }) // change > id is known
        .put(function (req, res, next) {
            store.replace(ressource, req.params.id, req.body);
            res.status(200).end();
        });
}
/**
 * > gets ressource
 * > sets href for each element
 * > is there a combined ressource
 * > sets href for array
 * > formats the output
 * GetRessources is called by all request for groups like user, tweets etc.
 * @param res the respond object
 * @param req the request object
 * @param obj the subaddress where route routes to as string
 * @param combineRessource the combineRessource for expanding where route routes to as strin
 */
function getRessources(res, req, ressource, combineRessource) {
    // array of all objects with type ressource from database
    var items = store.select(ressource);
    // hrefMaker (URL) set for each object, id is null because we are not searching for a special ressource
    // href maker runs through all specific elements of a ressource
    items = hrefMaker(items, req, ressource, null)
    // is there a combined ressource? > likes
    if (combineRessource !== undefined) {

        // loop: all objects (tweets) > getRessources the combineRessource for each object
        for (var i = 0; i < items.length; i++) {

            setCombinedRessource(items[i], combineRessource, req);
        }
    }
    // set href for whole array (ressource)
    // save whole array as obj, to deliver a href for the array
    var obj = {};

    // call hrefMaker for whole array (ressource)
    // instead of id > add setCombinedRessource if it exists
    obj = hrefMaker(obj, req, ressource, ((req.query.expand) ? "?expand=" + req.query.expand : ""));
    // put array in items
    obj.items = items;
    // obj contains items > return in json format
    res.json(obj);
}
/**
 * push contains list > cannot be applied to routing function
 * Push adds a new Object to the given resource group
 * @param res the respond object
 * @param req the request object
 * @param ressource the subaddress where route routes to as string
 */
function push(res,req,ressource){
    // generate new entry and id
    var id = store.insert(ressource, req.body);
    // set code 201 "created" and send the item back
    res.status(201).json(store.select(ressource, id));
}
/**
 * set href for combined ressource
 * method is only called if there is a combinedRessource
 * tweets/?setCombinedRessource=likes
 * singleRessource > single tweet
 * setCombinedRessource is a subroutine for expanding an combinedRessource of an object
 * @param singleRessource the object the combinedRessource belongs to
 * @param combinedRessource The combinedRessource that has to be expanded
 * @param req the Request object
 */
function setCombinedRessource(singleRessource, combinedRessource, req) {

    // add combinedRessource to each singleRessource
    // > tweets.likes > key added to the single ressource
    singleRessource[combinedRessource] = {};

    // check if expand exists in URL > did user set expand?
    // does expand contain our combinedRessource > likes?
    // split generates array in different indexe
    if (req.query.expand && req.query.expand.split(",").indexOf(combinedRessource) > -1) {
        // getRessources all attributes of an object > all likes of a tweet
        // getAllLikesForOneTweet gets tweet id
        var likes = getAllLikesForOneTweet(singleRessource.id);

        // every array element > combinedRessource > like > gets his own distinct href
        // all likes get href
        singleRessource[combinedRessource].items = hrefMaker(likes, req, combinedRessource, null);
    }

    // set href for the whole attributes > likes array
    singleRessource[combinedRessource] = hrefMaker(singleRessource[combinedRessource], req, "tweets/" + singleRessource.id + "/" + combinedRessource, null);
}
/**
 * the request gets its fitting URL as attribute
 * has to be called for all getRessources requests
 * @param req
 * @param element
 * @returns {string}
 */
function hrefMaker(objOrArr, req, ressource, id) {
    // http://localhost:3000/likes/(id), otherwise for id = empty String
    // host > localhost
    // ressource > f.E. likes


    // differentiate between array and object
    // if array: every element gets a href
    if (objOrArr instanceof Array) {

        for (var i = 0; i < objOrArr.length; i++) {
            objOrArr[i]["href"] = req.protocol + '://' + req.get('host') + "/" + ressource + "/" + objOrArr[i].id;
        }
        // if object (only one element): not clear, if likes oder like/id is wanted > either gets an id or not
    } else {
        objOrArr.href = req.protocol + '://' + req.get('host') + "/" + ressource + "/" + (id !== null ? id : "");
    }

    return objOrArr;
}


/**
 * this function returns all likes fitting to the tweet
 * @param id- tweet id of a tweet
 * @returns {Array} array of likes
 */
function getAllLikesForOneTweet(id) {
    // save all likes in one array
    var likes = store.select('likes');

    // array for special likes of a certain tweet
    var tweet_likes = [];

    // loop: run through all likes and check if they belong to the certain tweet
    // if yes > put like to tweet like
    for (var i = 0; i < likes.length; i++) {
        var like = likes[i];
        if (like.tweet_id === id) {
            tweet_likes.push(like);
        }
    }

    return tweet_likes;
}

// CatchAll for the rest (unfound routes/resources) ********

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers (express recognizes it by 4 parameters!)

// development error handler
// will print stacktrace as JSON response
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.log('Internal Error: ', err.stack);
        res.status(err.status || 500);
        res.json({
            error: {
                message: err.message,
                error: err.stack
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            error: {}
        }
    });
});


// Start server ****************************
app.listen(3000, function (err) {
    if (err !== undefined) {
        console.log('Error on startup, ', err);
    }
    else {
        console.log('Listening on port 3000');
    }
});