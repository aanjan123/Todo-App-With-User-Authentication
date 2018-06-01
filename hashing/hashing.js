const {SHA256} = require('crypto-js');

const jwt = require('jsonwebtoken');
var data = {
    id:10
}
var token = jwt.sign(data,'132');
console.log(token);
jwt.verify 