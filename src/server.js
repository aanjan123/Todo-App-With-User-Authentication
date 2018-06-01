const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {
    ObjectID
} = require('mongodb');

const port = process.env.PORT || 3000;

const {
    authenticate
} = require('../middleware/authenticate');

const {
    mongoose
} = require('../db/mongoose.js');

const {
    Todo
} = require('../models/Todo.js');

const {
    User
} = require('../models/User.js');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('hello');
});

app.post('/todos',authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        name: req.body.name,
        completed: req.body.completed,
        _creator:req.user._id        
    });

    save(todo, res);

});

app.post('/user',  (req, res) => {
    var user = new User({
        email: req.body.email,
        password: req.body.password,
    });

    user.save().then((doc) => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('X-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });
});


app.get('/todos/:id', authenticate,(req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid Id' + id);
    }
    Todo.findById(id).then((doc) => {
        if (!doc) {
            return res.status(400).send('Invalid Id' + id);
        }
        res.send(doc);
    }).catch((err) => {
        res.status(400).send(err);
    });

});


app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(400).send('Invalid id' + id);
    }
    Todo.findByIdAndRemove({
        _id: id
    }).then((doc) => {
        if (!doc) {
            return res.status(400).send('Invalid Id' + id);
        }
        res.send(doc);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.patch('/todos/:id', (req, res) => {

    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'name', 'completed']);

    if (!ObjectID.isValid(id)) {
        res.status(400).send();
    }

    Todo.findByIdAndUpdate(id, {
        $set: body
    }, {
        new: true
    }).then((todo) => {
        if (!todo) {
            return res.status(400).send();
        }
        res.send(todo);
    }).catch((err) => {
        res.status(400).send();
    });

});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password', 'tokens']);

    var users = new User(body);

    save(users, res);
});


function save(modelName, res) {

    modelName.save().then((doc) => {
        // return modelName.generateAuthToken();
        res.send(doc);
        // return 
    }).then((token) => {
        res.header('X-auth', token).send(modelName);
    }).catch((err) => {
        res.status(400).send(err);
    });
}



app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findUserWithCreadentials(body.email, body.password).then((user) => {
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.listen(port);