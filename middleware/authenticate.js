const {
    User
} = require('./../models/User.js');

var authenticate = (req, res, next) => {
    var token = req.header('X-auth');

    User.findByToken(token).then((user) => {
        if (user) {
            // res.send(response);
            req.user = user;
            req.token = token;
            next();

        } else {
            res.status(401).send();
        }
    }).catch((err) => {
        res.status(401).send();

    })
}

module.exports = {
    authenticate
}