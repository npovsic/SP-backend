let express = require('express');
let router = express.Router();
let Event = require('../models/Event');
let User = require('../models/User');

let hash_salt = require('password-hash-and-salt');

router.get('/profile', function (req, res, next) {
    checkIfUserLoggedIn(req, res);

    let user = req.session.user;

    User.findOne({ username: user.username }).exec((err, user_doc) => {
        res.render('users/accountOverview', { title: 'Events | ' + user.username, logged_in: user, user: user_doc });
    });
});

router.get('/profile/edit', function (req, res, next) {
    checkIfUserLoggedIn(req, res);

    let user = req.session.user;

    User.findOne({ username: user.username }).exec((err, user_doc) => {
        if (user.username === user_doc.username) {
            user_doc.password = "";
            res.render('users/editAccount', { title: 'Events | Edit', user: user_doc });
        }
        else {
            res.redirect('/');
        }
    });
});

router.post('/:username/edit', function (req, res, next) {
    checkIfUserLoggedIn(req, res);

    let user = req.session.user;

    User.findOne({ username: user.username }).exec((err, user_doc) => {
        if (req.body.password != "") {
            hash_salt(req.body.password).hash(function (error, hash) {
                user_doc.first_name = (req.body.first_name != "") ? req.body.first_name : user_doc.first_name;
                user_doc.last_name = (req.body.last_name != "") ? req.body.last_name : user_doc.last_name;
                user_doc.email = (req.body.email != "") ? req.body.email : user_doc.email;
                user_doc.city = (req.body.city != "") ? req.body.city : user_doc.city;
                user_doc.password = hash;

                user_doc.save((err, saved_doc) => {
                    res.redirect('/users/profile');
                });
            });

        } else {
            user_doc.first_name = (req.body.first_name != "") ? req.body.first_name : user_doc.first_name;
            user_doc.last_name = (req.body.last_name != "") ? req.body.last_name : user_doc.last_name;
            user_doc.email = (req.body.email != "") ? req.body.email : user_doc.email;
            user_doc.city = (req.body.city != "") ? req.body.city : user_doc.city;

            user_doc.save((err, saved_doc) => {
                res.redirect('/users/profile');
            });
        }

    });
});

router.get('/profile/events', function (req, res, next) {
    checkIfUserLoggedIn(req, res);

    let user = req.session.user;

    User.findOne({ username: user.username }).deepPopulate(['events.going.host', 'events.created.host']).exec((err, user_doc) => {
        res.render('users/events', {
            title: 'Events | ' + user.username + '\'s events',
            logged_in: user,
            user: user_doc,
            created: user_doc.events.created,
            going: user_doc.events.going
        });
    });
});

module.exports = router;

const checkIfUserLoggedIn = (req, res) => {
    if (req.session.user) return true;

    req.session.mustBeLoggedIn = true;

    res.redirect('/login');

    return false;
};