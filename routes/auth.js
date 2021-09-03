const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');

const User = mongoose.model('User');

router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(422).json({ error: "please add all the fields" });
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: 'user already exists with that email' });
            }
            bcrypt.hash(password, 12).then((hashedPassword) => {
                const user = new User({ email, name, password: hashedPassword });
                user.save().then(user => {
                    res.json({ message: 'user saved successfully' });
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "please provide email or password" });
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (!savedUser) {
                return res.status(422).json({ error: 'user does not exist' });
            }
            bcrypt.compare(password, savedUser.password).then((doMatch) => {
                if (doMatch) {
                    const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
                    const { _id, name, email, followers, following } = savedUser;
                    res.json({ token, user: { _id, name, email, followers, following } });
                } else {
                    return res.status(422).json({ error: 'invalid email or password' });
                }
            }).catch((err) => {
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
});

module.exports = router;