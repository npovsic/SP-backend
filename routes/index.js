let express = require('express');
let router = express.Router();
let Event = require('../models/Event');
let User = require('../models/User');

let hash_salt = require('password-hash-and-salt');

let lang = 'en';

// GET zahtevek za landing page
router.get('/', function (req, res, next) {
    if (req.cookies.lang) {
        lang = req.cookies.lang;
    }

    let user = req.session.user;

    Event.find({}).exec((err, events) => {
        if (err) {
            console.log(err);
        }

        let eventsByUser = [];

        if (user) {
            events.forEach((event) => {
                if (event.host.equals(user._id)) {
                    eventsByUser.push(event);
                }
            });
        }

        res.render('index', {
            lang: lang,
            title: 'Events',
            upcomingEvents: events,
            eventsByUser: eventsByUser,
            user: user
        });
    });
});

router.get('/events', function (req, res, next) {
    let user = req.session.user;
    let sortBy = req.query.sort;

    Event.find({}).populate('host').exec((err, events) => {
        res.render('allEvents', {
            title: 'Events | All events',
            events: events,
            sort: (sortBy ? sortBy : "date"),
            user: user
        });
    });
});

router.get('/events/add', function (req, res, next) {
    checkIfUserLoggedIn(req, res);

    let user = req.session.user;

    res.render('addEvent', { title: 'Events | Add event', user: user });
});

router.post('/events/add', function (req, res, next) {
    checkIfUserLoggedIn(req, res);

    let host = req.session.user;

    if (req.body.name === "" ||
        req.body.date === "" ||
        req.body.time === "" ||
        req.body.location === "" ||
        req.body.description === "") {
        res.render('addEvent', { title: 'Events | Add event', user: host, failed: 'Some fields are empty.' });
    }
    // else if (!validateDate(req.body.event_date) || !validateTIme(req.body.event_time)) {
    //     res.render('addEvent', { title: 'Events | Add event', user: host, failed: 'Wrong date or time format.' });
    // }
    let event = new Event({
        title: req.body.name,
        date: req.body.date,
        time: req.body.time,
        location: req.body.location,
        description: req.body.description,
        going: [
            host
        ],
        host: host
    });

    event.save((err, event_doc) => {
        if (err) {
            if (err.code === 11000) {
                console.log('This username is taken.');
            }
            else {
                console.log('An error occured saving the event', err);
            }
        }
        else {
            User.findOne({ username: host.username }).exec((err, user_doc) => {
                user_doc.events.created.push(event_doc);
                user_doc.save(err => {
                    res.redirect('/events/' + event_doc._id);
                });
            });
        }
    });
});

router.get('/events/:id', function (req, res, next) {
    let user = req.session.user;

    Event.findOne({ _id: req.params.id }).populate('host').exec((err, eventDoc) => {
        if (err || !eventDoc) {
            res.render('eventNotFound');
            return;
        }

        if (user) {
            let going = false;

            for (let goingUser of eventDoc.going) {
                if (goingUser.equals(user._id)) {
                    going = true;
                }
            }

            eventDoc.description = eventDoc.description.replace(/(?:\r\n|\r|\n)/g, '<br />');

            res.render('eventDetails', {
                title: 'Events | ' + eventDoc.title,
                event: eventDoc,
                user: user,
                going: going
            });
        }
        else {
            res.render('eventDetails', {
                title: 'Events | ' + eventDoc.title,
                event: eventDoc,
                user: user
            });
        }
    });
});

// user is going to the event
router.post('/events/:id', function (req, res, next) {
    checkIfUserLoggedIn(req, res);

    let user = req.session.user;

    if (req.body.going) {
        Event.findOne({ _id: req.params.id }).exec((err, event_doc) => {
            event_doc.going.push(user);
            event_doc.save((err, doc) => {
                User.findOne({ username: user.username }).exec((err, user_doc) => {
                    user_doc.events.going.push(event_doc);
                    user_doc.save(err => {
                        res.redirect('/events/' + event_doc._id);
                        // res.render('event_details', { title: 'Events | ' + event_doc.title, event : event_doc, user: user_doc, going: true });
                    });
                });
            });
        });
    }
    else if (req.body.not_going) {
        Event.findOne({ _id: req.params.id }).exec((err, event_doc) => {
            event_doc.going.pull(user);
            event_doc.save((err, doc) => {
                User.findOne({ username: user.username }).exec((err, user_doc) => {
                    user_doc.events.going.pull(event_doc);
                    user_doc.save(err => {
                        res.redirect('/events/' + event_doc._id);
                        // res.render('event_details', { title: 'Events | ' + event_doc.title, event : event_doc, user: user_doc, going: false });
                    });
                });
            });
        });
    }
});

router.get('/search', function (req, res, next) {
    let user = (typeof req.session.user === 'undefined') ? null : req.session.user;
    let query = req.query.search_query;

    if (typeof query !== 'undefined' && query !== "") {
        let q = query.split(' ');

        console.log("Query:", query, q);

        Event.find({
            $or: [{ title: { '$regex': query, '$options': 'i' } }, {
                title: {
                    '$regex': q[0],
                    '$options': 'i'
                }
            }]
        }).populate('host').exec((err, events) => {
            if (err) {
                console.log(err);
                return;
            }

            res.render('search', { title: 'Events | Search', search_query: query, events: events, user: user });
        });
    }
    else {
        res.render('search', { title: 'Events | Search', user: user });
    }
});

router.get('/register', function (req, res, next) {
    if (req.session.user) {
        redirect('/');
        
        return;
    }
    
    res.render('register', { title: 'Events | Register' });
});

router.post('/register', function (req, res, next) {
    if (req.session.user) {
        redirect('/');

        return;
    }
    
    if (req.body.firstName === "" ||
        req.body.lastName === "" ||
        req.body.city === "" ||
        req.body.email === "" ||
        req.body.username === "" ||
        req.body.password === ""
    ) {
        res.redirect('/register', { error: true });
    }
    else {
        hash_salt(req.body.password).hash(function (error, hash) {
            let user = new User({
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                city: req.body.city,
                country: 'Slovenia',
                email: req.body.email,
                username: req.body.username,
                password: hash
            });

            user.save((err, user) => {
                if (err) {
                    if (err.code === 11000) {
                        res.redirect(req.headers.referer);
                    }

                    console.log(err);
                }

                req.session.user = user;
                res.redirect('/');
            });
        });
    }
});

router.get('/login', function (req, res, next) {
    let user = req.session.user;

    if (user) {
        res.redirect('/');
    }
    else {
        res.render('login');
    }
});

router.post('/login', function (req, res, next) {
    let user = req.session.user;

    if (user) {
        res.redirect('/');

        return;
    }

    let username = req.body.username;
    let password = req.body.password;

    User.findOne({ username: username }).exec((err, user) => {
        if (!user || err) {
            res.render('login', { error: true });
        }
        else {
            hash_salt(password).verifyAgainst(user.password, function (error, verified) {
                if (error) {
                    res.render('login', { error: true });
                }
                if (!verified) {
                    res.render('login', { error: true });
                } else {
                    user.password = "";
                    req.session.user = user;
                    res.redirect('/');
                }
            });
        }
    });
});

router.get('/logout', function (req, res, next) {
    let user = req.session.user;

    if (user) {
        req.session.reset();
    }

    res.redirect('/');
});

module.exports = router;

const checkIfUserLoggedIn = (req, res) => {
    if (req.session.user) return true;

    req.session.mustBeLoggedIn = true;

    res.redirect('/login');

    return false;
};