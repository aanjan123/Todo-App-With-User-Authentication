const mongoose = require('mongoose');


var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        minlength: 5,
        required: true
    },
    completed: {
        type: Boolean,
        required: true
    },
    name: {
        type: String,
        maxlength: 150,
        trim:true,
        required: true
    },
    age: {
        type: Number,
        maxlength: 3,
    },
    _creator:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }

});
module.exports = {
    Todo:Todo
}