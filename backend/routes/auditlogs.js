var express = require('express');
var router = express.Router();
let auditlogModel = require('../models/AuditLog')

router.get('/', async function (req, res, next) {
    let queries = req.query;
    let filter = {
        isDeleted: false
    };
    if (queries.action) filter.action = queries.action;
    if (queries.collectionName) filter.collectionName = queries.collectionName;
    if (queries.user) filter.user = queries.user;

    let data = await auditlogModel.find(filter).populate({
        path: 'user',
        select: 'username fullName email'
    }).sort({
        createdAt: -1
    });
    res.send(data);
});
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await auditlogModel.find({
            isDeleted: false,
            _id: id
        });
        if (result.length) {
            res.send(result[0])
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});
router.post('/', async function (req, res) {
    let newLog = new auditlogModel({
        user: req.body.user,
        action: req.body.action,
        collectionName: req.body.collectionName,
        documentId: req.body.documentId,
        changes: req.body.changes,
        ipAddress: req.body.ipAddress
    })
    await newLog.save()
    res.send(newLog)
})
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await auditlogModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            result.isDeleted = true
            await result.save();
            res.send({ message: "Xoa thanh cong", data: result })
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

module.exports = router;
