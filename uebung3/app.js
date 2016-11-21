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
    // array von allen tweets aus der db
    var items = store.select('tweets');
    // hrefMaker (URL) für jeden tweet setzen
    items = hrefMaker(items, req, "tweets", null);

    // Schleife: alle tweets > für jeden tweet die jeweiligen likes holen
    for (var i = 0; i < items.length; i++) {

        // zu dem einzelnen tweet wird attribut likes angehangen als obj
        items[i]['likes'] = {};

        // abfrage, ob expand existiert
        if (req.query.expand) {

            // nehme String und mach ein Array daraus wenn es mit Komma getrennt ist
            var expand = req.query.expand.split(",");

            //wenn in unserem array ein like existiert, dann bekommen wir ein index größer -1
            if(expand.indexOf('likes') > -1) {

                // alle likes für den tweet holen
                var tweet_likes = expandLikes(items[i]['id']);

                // das array mit treffer-likes wird unter likes.items gespeichert
                // jedes array element (like) bekommt seinen eindeutigen href zugewiesen
                items[i]['likes']['items'] = hrefMaker(tweet_likes, req, "likes", null);
            }

        }
        // returns http://localhost:3000/tweets/id/likes/
        // href für das gesamte likes-array setzen
        items[i]['likes'] = hrefMaker(items[i]['likes'], req, "tweets/" + items[i]['id'] + "/likes", null);

    }

    // das gesamte array als obj speichern, um dem kompletten array ein href zu geben
    var obj = {};

    console.log(req.query);

    obj = hrefMaker(obj, req, "tweets", ((req.query.expand) ? "?expand=" + req.query.expand : ""));
    obj.items= items;

    // items sind schon im obj enthalten und werden im json format zurückgegeben
    res.json(obj);
});

app.post('/tweets', function (req, res, next) {
    var id = store.insert('tweets', req.body);
    // set code 201 "created" and send the item back
    res.status(201).json(store.select('tweets', id));
});


app.get('/tweets/:id', function (req, res, next) {
    // tweet mit der passenden id holen
    var tweet = store.select('tweets', req.params.id);

    // zu dem einzelnen tweet wird attribut likes angehangen als obj
    tweet.likes = {};

    // abfrage, ob expand existiert und ob es likes ist
    if (req.query.expand) {

        var expand = req.query.expand.split(",");

        if(expand.indexOf('likes') > -1) {

            // alle likes eines tweets holen
            var tweet_likes = expandLikes(tweet.id);

            // day array mit treffer-likes wird unter likes.items gespeichert
            // jedes array element (like) bekommt seinen eindeutigen href zugewiesen
            tweet.likes.items = hrefMaker(tweet_likes, req, "likes", null);
        }

    }
    // returns http://localhost:3000/tweets/id/likes/
    // href für das gesamte likes-array setzen
    tweet.likes = hrefMaker(tweet.likes, req, "tweets/" + req.params.id + "/likes", null);

    // link für den tweet setzen > nach tweet/id wurde gesucht
    // wenn im request ein expand mitgeschickt wurde, wird er an den href hinzugefügt
    tweet = hrefMaker(tweet, req, "tweets", tweet.id + ((req.query.expand) ? "?expand=" + req.query.expand: ""));

    res.json(tweet);
});

app.delete('/tweets/:id', function (req, res, next) {
    store.remove('tweets', req.params.id);
    res.status(200).end();
});

app.put('/tweets/:id', function (req, res, next) {
    store.replace('tweets', req.params.id, req.body);
    res.status(200).end();
});

/**
 * USER
 */

app.get('/users', function (req, res, next) {

    var items = store.select('users');
    items = hrefMaker(items, req, "users", null);
    var obj = {items: items};
    obj = hrefMaker(obj, req, "users", null);

    res.json(obj);
});

app.post('/users', function (req, res, next) {
    var id = store.insert('users', req.body);
    // set code 201 "created" and send the item back
    res.status(201).json(store.select('users', id));
});

app.get('/users/:id', function (req, res, next) {
    var user = store.select('users', req.params.id);
    user = hrefMaker(user, req, "users", user.id);
    res.json(user);
});

app.delete('/users/:id', function (req, res, next) {
    store.remove('users', req.params.id);
    res.status(200).end();
});

app.put('/users/:id', function (req, res, next) {
    store.replace('users', req.params.id, req.body);
    res.status(200).end();
});

/**
 * LIKES: our own ressource route with handler functions
 *
 * Use REST Level 2
 * --- no commands in body part
 * --- Konzept der Navigation über Ressourcen URLs und Manipulation über HTTP Methoden
 *
 */

// returns list with all likes
// dont need id field


// alle likes auflisten
app.get('/likes', function (req, res, next) {
    // alle likes holen > array aus der db
    var items = store.select('likes');

    // alle likes haben keine id, deswegen null
    items = hrefMaker(items, req, "likes", null);

    // referenz zum array schaffen
    var obj = {items: items};

    // das ganze array mit href referenzieren
    obj = hrefMaker(obj, req, "likes", null);

    // json generates string
    res.json(obj);
});


// neuen like anlegen > noch keine id vorhanden > hinzufügen
app.post('/likes', function (req, res, next) {
    var id = store.insert('likes', req.body);
    // set code 201 "created" and send the item back
    res.status(201).json(store.select('likes', id));
});


// Create Route for likes > resumes all input with /likes/id
// avoid syntax mistakes

app.route('/likes/:id')
// bestimmtes like auflisten
    .get(function (req, res, next) {
        var like = store.select('likes', req.params.id);
        // href aufrufen, ressource und id übergeben
        like = hrefMaker(like, req, "likes", like.id);
        res.json(like);
    }) // löschen > likes können nur einzeln gelöscht werden
    .delete(function (req, res, next) {
        store.remove('likes', req.params.id);
        res.status(200).end();
    }) // ändern > id ist bekannt
    .put(function (req, res, next) {
        store.replace('likes', req.params.id, req.body);
        res.status(200).end();
    });


/**
 * Aus der Request Anfrage wird die passende URL als Attribut mit zurückgegeben
 * muss auf alle Get requests angewendet werden
 * @param req
 * @param element
 * @returns {string}
 */
function hrefMaker(objOrArr, req, ressource, id) {
    // http://localhost:3000/likes/(id), ansonsten für id = leerer String
    // host > localhost
    // ressource > z.B. likes


    // unterscheiden zwischen array und object
    // if array: jedes element bekommt ein href
    if (objOrArr instanceof Array) {

        for (var i = 0; i < objOrArr.length; i++) {
            objOrArr[i]["href"] = req.protocol + '://' + req.get('host') + "/" + ressource + "/" + objOrArr[i].id;
        }
        // if object (only one element): unbekannt, ob man nach likes oder like/id sucht > id anhängen oder nicht
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
function expandLikes(id){
    // alle likes likes in einem array speichern
    var likes = store.select('likes');

    // array für die speziellen likes eines bestimmten tweets
    var tweet_likes = [];

    // for schleife durchläuft alle likes und überprüft, ob sie zu dem speziellen tweet gehören
    // wenn ja, wird like zu tweet_likes hinzugefügt
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