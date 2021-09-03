const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model('Post');

router.get('/allpost', requireLogin, (req, res) => {
    Post.find().populate('postedBy', '_id name')
        .sort('-createdAt')
        .then(posts => {
            res.json({ posts });
        }).catch(err => {
            console.log(err);
        });
});

router.get('/getsubpost', requireLogin, (req, res) => {
    //if postedBy in following
    Post.find({postedBy:{$in: req.user.following}}).populate('postedBy', '_id name')
        .sort('-createdAt')
        .then(posts => {
            res.json({ posts });
        }).catch(err => {
            console.log(err);
        });
});

router.get('/mypost', requireLogin, (req, res) => {
    //console.log(req);
    Post.find({ postedBy: req.user._id }).populate('postedBy', '_id name')
        .then(mypost => {
            res.json({ mypost });
        }).catch(err => {
            console.log(err);
        });
});

router.post('/createpost', requireLogin, (req, res) => {
    const { title, body, pic } = req.body;
    if (!title || !body || !pic) {
        return res.status(422).json({ error: 'please add all the fields' });
    }
    req.user.password = undefined;
    const post = new Post({
        title,
        body,
        photo: pic,
        postedBy: req.user
    });
    post.save().then(result => {
        res.json({ post: result });
    }).catch(err => {
        console.log(err);
    });
});

router.delete('/delete/:postId', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postId })
        .populate('postedBy', '_id')
        .exec((err, post) => {
            if (err || !post) {
                return res.status(422).json({ error: err });
            }
            if (post.postedBy._id.toString() === req.user._id.toString()) {
                post.remove().then((result) => {
                    res.json(result);
                }).catch(err => {
                    console.log(err);
                })
            }
        })
});

module.exports = router;