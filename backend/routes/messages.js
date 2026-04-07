var express = require('express');
var router = express.Router();
let userModel = require('../models/User');
let messageModel = require('../models/Message');
let notificationModel = require('../models/Notification');
let { checkLogin } = require('../utils/authHandler');
let { EmitToUsers } = require('../utils/socket');

router.post('/', checkLogin, async function (req, res, next) {
    try {
        let senderId = req.user._id;
        let recipientId = req.body.to;
        let messageText = req.body.text;

        if (!recipientId || !messageText) {
            res.status(400).send({ message: 'to and text are required' });
            return;
        }

        let recipientUser = await userModel.findOne({
            _id: recipientId,
            isDeleted: false
        });
        if (!recipientUser) {
            res.status(404).send({
                message: 'recipient user not found'
            });
            return;
        }

        let newMessage = new messageModel({
            from: senderId,
            to: recipientId,
            messageContent: messageText
        });
        await newMessage.save();
        await newMessage.populate('from to', 'username fullName email');

        let senderNotification = new notificationModel({
            recipient: senderId,
            sender: recipientId,
            title: 'Message sent',
            content: `You sent a message to ${recipientUser.username}`,
            type: 'message-created',
            referenceModel: 'Message',
            referenceId: newMessage._id
        });
        let recipientNotification = new notificationModel({
            recipient: recipientId,
            sender: senderId,
            title: 'New message',
            content: `You received a message from ${req.user.username}`,
            type: 'message-created',
            referenceModel: 'Message',
            referenceId: newMessage._id
        });
        await senderNotification.save();
        await recipientNotification.save();

        EmitToUsers('newMess', {
            from: senderId,
            to: recipientId,
            message: newMessage
        }, [senderId.toString(), recipientId.toString()]);

        let notificationRecipients = [senderId.toString(), recipientId.toString()];
        EmitToUsers('notification-created', {
            type: 'message-created',
            referenceId: newMessage._id,
            recipientIds: notificationRecipients
        }, notificationRecipients);

        res.send(newMessage);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get('/:userid', checkLogin, async function (req, res, next) {
    try {
        let senderId = req.user._id;
        let targetUserId = req.params.userid;

        let targetUser = await userModel.findOne({
            _id: targetUserId,
            isDeleted: false
        });
        if (!targetUser) {
            res.status(404).send({
                message: 'target user not found'
            });
            return;
        }

        let messages = await messageModel.find({
            isDeleted: false,
            $or: [{
                from: senderId,
                to: targetUserId
            }, {
                to: senderId,
                from: targetUserId
            }]
        }).sort({
            createdAt: 1
        }).populate('from to', 'username fullName email');

        res.send(messages);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.delete('/:id', checkLogin, async function (req, res, next) {
    try {
        let id = req.params.id;
        let currentUserId = req.user._id;

        let result = await messageModel.findOne({
            _id: id,
            isDeleted: false,
            $or: [{ from: currentUserId }, { to: currentUserId }]
        });

        if (result) {
            result.isDeleted = true;
            await result.save();
            res.send({ message: 'Xoa thanh cong', data: result });
        } else {
            res.status(404).send({ message: 'ID NOT FOUND' });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;