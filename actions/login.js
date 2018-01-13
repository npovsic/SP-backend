import User from '../models/User';

export default loginHandler = (username, password) => {
    User.findOne({ username: username }).exec((err, user) => {
        if (!user || err) {
            return false;
        }
        else {
            hash_salt(password).verifyAgainst(user.password, function (error, verified) {
                if (error) {
                    return false;
                }
                if (!verified) {
                    return false;
                } else {
                    user.password = "";
                    req.session.user = user;
                    res.redirect('/');
                }
            });
        }
    });
};