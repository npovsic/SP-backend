const express = require('express');
const session = require('client-sessions');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const FileStreamRotator = require('file-stream-rotator');
const morgan = require('morgan');

let logFile = fs.createWriteStream('./myLogFile.log', {flags: 'a'});

let csrf = require('csurf');

// hbs is the handlebars package
let hbs = require('hbs');

// import handlebars helpers
let ifEqual = require('./handlebarsHelpers/ifEqual.js');
let translate = require('./handlebarsHelpers/translate.js');

let mongo = require('mongodb');
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/events');
mongoose.Promise = global.Promise;

let index = require('./routes/index');
let users = require('./routes/users');

let app = express();

let logDirectory = './log';

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

let accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false
});

// use logging
app.use(morgan('combined', {stream: accessLogStream}));

hbs.registerPartials(__dirname + '/views/partials');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// define the cookie, that will be used for the session
app.use(session({
    cookieName: 'session',
    secret: 'session_secret',
    duration: 30 * 24 * 60 * 60 * 1000,
    activeDuration: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
}));

/**
 * set all routes here
 */

app.use('/', index);

// all routes using the /users prefix are handled in another file
app.use('/users', users);

// catch the 404 error
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    let user = (typeof req.session.user === "undefined") ? null : req.session.user;

    // render the 404 pageconst
    res.status(err.status || 500);
    res.render('error', {title: 'Events', user: user});
});

module.exports = app;
