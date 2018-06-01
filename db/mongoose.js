const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/Users';

mongoose.Promise = global.Promise;

mongoose.connect(url);

module.exports = {
    mongoose
}