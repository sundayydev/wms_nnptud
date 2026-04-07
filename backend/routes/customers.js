var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let customerModel = require('../models/Customer');
let { logAction } = require('../utils/auditlogHandler');
let { checkLogin } = require('../utils/authHandler');

router.get('/', async function (req, res, next) {
    let queries = req.query;
    let filter = {
        isDeleted: false
    };
    if (queries.name) filter.name = new RegExp(queries.name, 'i');
    if (queries.phone) filter.phone = new RegExp(queries.phone, 'i');
    if (queries.customerType) filter.customerType = queries.customerType;

    let data = await customerModel.find(filter);
    res.send(data);
});

router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await customerModel.find({
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
        })
    }
});

router.post('/', checkLogin, async function (req, res, next) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let newCustomer = new customerModel({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            customerType: req.body.customerType
        });
        await newCustomer.save({ session });
        logAction(req.user ? req.user._id : null, 'CREATE', 'customer', newCustomer._id, newCustomer, req.ip);
        await session.commitTransaction();
        res.send(newCustomer);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({
            message: error.message
        });
    } finally {
        session.endSession();
    }
});

router.put('/:id', checkLogin, async function (req, res, next) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let oldData = await customerModel.findOne({
            isDeleted: false,
            _id: id
        }).session(session);
        if (!oldData) {
            await session.abortTransaction();
            res.status(404).send({
                message: "ID NOT FOUND"
            });
            return;
        }
        let result = await customerModel.findByIdAndUpdate(id, req.body, { new: true, session });
        logAction(req.user ? req.user._id : null, 'UPDATE', 'customer', id, { old: oldData, new: result }, req.ip);
        await session.commitTransaction();
        res.send(result);
    } catch (error) {
        await session.abortTransaction();
        res.status(404).send({
            message: error.message
        });
    } finally {
        session.endSession();
    }
});

router.delete('/:id', checkLogin, async function (req, res, next) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let result = await customerModel.findOne({
            isDeleted: false,
            _id: id
        }).session(session);
        if (result) {
            result.isDeleted = true;
            await result.save({ session });
            logAction(req.user ? req.user._id : null, 'DELETE', 'customer', id, result, req.ip);
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
