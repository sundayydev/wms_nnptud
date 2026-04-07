var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
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
    let session = await mongoose.startSession();
    session.startTransaction();
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
        await newItem.save({ session });
        await session.commitTransaction();
        res.send(newItem);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({
            message: error.message
        });
    } finally {
        session.endSession();
    }
});

router.put('/:id', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let result = await salesorderModel.findByIdAndUpdate(id, req.body, { new: true, session });
        if (result) {
            await session.commitTransaction();
            res.send(result);
        } else {
            await session.abortTransaction();
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        await session.abortTransaction();
        res.status(404).send({
            message: error.message
        });
    } finally {
        session.endSession();
    }
});

router.delete('/:id', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let result = await salesorderModel.findOne({
            isDeleted: false,
            _id: id
        }).session(session);
        if (result) {
            result.isDeleted = true;
            await result.save({ session });
            await session.commitTransaction();
            res.send({ message: "Xoa thanh cong", data: result });
        } else {
            await session.abortTransaction();
            res.status(404).send({
                message: "ID NOT FOUND"
            });
        }
    } catch (error) {
        await session.abortTransaction();
        res.status(404).send({
            message: error.message
        });
    } finally {
        session.endSession();
    }
});

module.exports = router;
