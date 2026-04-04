var express = require('express');
var router = express.Router();
let salesorderModel = require('../schemas/salesorders');

router.get('/', async function (req, res, next) {
    let data = await salesorderModel.find({
        isDeleted: false
    });
    res.send(data);
});

router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await salesorderModel.find({
            isDeleted: false,
            _id: id
        });
        if (result.length) {
            res.send(result[0]);
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            });
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        });
    }
});

router.post('/', async function (req, res) {
    try {
        let newItem = new salesorderModel({
            soNumber: req.body.soNumber,
            customer: req.body.customer,
            warehouse: req.body.warehouse,
            items: req.body.items,
            totalAmount: req.body.totalAmount,
            status: req.body.status || 'Pending',
            createdBy: req.body.createdBy
        });
        await newItem.save();
        res.send(newItem);
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await salesorderModel.findByIdAndUpdate(
            id, req.body, {
            new: true
        });
        res.send(result);
    } catch (error) {
        res.status(404).send({
            message: error.message
        });
    }
});

router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await salesorderModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            result.isDeleted = true;
            await result.save();
            res.send(result);
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            });
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        });
    }
});

module.exports = router;
