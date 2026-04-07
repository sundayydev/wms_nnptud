var express = require('express');
var router = express.Router();
let notificationModel = require('../models/Notification');
let { checkLogin } = require('../utils/authHandler');

router.get('/unread-count', checkLogin, async function (req, res, next) {
    try {
        let count = await notificationModel.countDocuments({
            isDeleted: false,
            recipient: req.user._id,
            isRead: false
        });
        res.send({ count: count });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get('/', checkLogin, async function (req, res, next) {
    try {
        let queries = req.query;
        let filter = {
            isDeleted: false,
            recipient: req.user._id
        };

        if (queries.isRead === 'true') filter.isRead = true;
        if (queries.isRead === 'false') filter.isRead = false;
        if (queries.type) filter.type = queries.type;

        let data = await notificationModel.find(filter)
            .populate({ path: 'sender', select: 'username fullName email' })
            .populate({ path: 'recipient', select: 'username fullName email' })
            .sort({ createdAt: -1 });

        res.send(data);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get('/:id', checkLogin, async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await notificationModel.find({
            isDeleted: false,
            recipient: req.user._id,
            _id: id
        }).populate({ path: 'sender', select: 'username fullName email' });

        if (result.length) {
            res.send(result[0]);
        } else {
            res.status(404).send({ message: 'ID NOT FOUND' });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.put('/:id/read', checkLogin, async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await notificationModel.findOne({
            isDeleted: false,
            recipient: req.user._id,
            _id: id
        });

        if (result) {
            result.isRead = true;
            await result.save();
            res.send(result);
        } else {
            res.status(404).send({ message: 'ID NOT FOUND' });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.delete('/:id', checkLogin, async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await notificationModel.findOne({
            isDeleted: false,
            recipient: req.user._id,
            _id: id
        });

        if (result) {
            result.isDeleted = true;
            await result.save();
            res.send({ message: 'Xoa thanh cong', data: result });
        } else {
            res.status(404).send({ message: 'ID NOT FOUND' });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;