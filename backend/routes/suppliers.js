var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let supplierModel = require('../models/Supplier')
let { logAction } = require('../utils/auditlogHandler')

/* GET all suppliers */
router.get('/', async function (req, res, next) {
    try {
        let queries = req.query;
        let filter = {};
        if (queries.name) filter.name = new RegExp(queries.name, 'i');
        if (queries.phone) filter.phone = new RegExp(queries.phone, 'i');

        let data = await supplierModel.find(filter);
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* GET supplier by ID */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await supplierModel.findById(id);
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

/* POST create supplier */
router.post('/', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let newSupplier = new supplierModel({
            name: req.body.name,
            contactPerson: req.body.contactPerson,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address
        });
        await newSupplier.save({ session });
        logAction(req.user ? req.user._id : null, 'CREATE', 'supplier', newSupplier._id, newSupplier, req.ip);
        await session.commitTransaction();
        res.send(newSupplier);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({ message: error.message });
    } finally {
        session.endSession();
    }
});

/* PUT update supplier */
router.put('/:id', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let oldData = await supplierModel.findById(id).session(session);
        let result = await supplierModel.findByIdAndUpdate(id, req.body, { new: true, session });
        if (result) {
            logAction(req.user ? req.user._id : null, 'UPDATE', 'supplier', id, { old: oldData, new: result }, req.ip);
            await session.commitTransaction();
            res.send(result);
        } else {
            await session.abortTransaction();
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({ message: error.message });
    } finally {
        session.endSession();
    }
});

/* DELETE supplier */
router.delete('/:id', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let result = await supplierModel.findByIdAndDelete(id, { session });
        if (result) {
            logAction(req.user ? req.user._id : null, 'DELETE', 'supplier', id, result, req.ip);
            await session.commitTransaction();
            res.send({ message: "Deleted successfully", data: result });
        } else {
            await session.abortTransaction();
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({ message: error.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;
