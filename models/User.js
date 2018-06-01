const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: '{value} is not a valid email'
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {

            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject,['_id','email']);
}

UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id:user._id.toHexString(),access},'abc').toString();

    user.tokens.push({access,token});
    return user.save().then((docs)=>{
        // console.log(docs);
        return token;
    })

}

UserSchema.statics.findByToken = function(token) {
    var user = this;
    var decoded;

    try{
        decoded = jwt.verify(token,'abc');
    }catch(e){
        return Promise.reject();
    }

    return User.findOne({
       '_id':decoded._id,
       'tokens.access':'auth',
       'tokens.token':token
    });
}


UserSchema.pre('save', function(next){

    var user =this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt,(err,hash)=>{
                user.password = hash;
                next();
            })
        })
    }else {
        next();
    }
});

UserSchema.statics.findUserWithCreadentials = function(email,password, callback){
    var User = this;

    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }
        return user;

        return new Promise((resolve, reject)=>{
            bcrypt.compare(password,user.password, (err, result)=>{
                if(result){
                    resolve(user);
                    
                }else {
                    reject();
                }
            });
        });
    });
}


var User = mongoose.model('user',UserSchema );

module.exports = {
    User
}