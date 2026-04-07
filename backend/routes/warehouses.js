var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let warehouseModel = require('../models/Warehouse');
let { logAction } = require('../utils/auditlogHandler');
let { checkLogin } = require('../utils/authHandler');
require('../models/User');

/* GET all warehouses */
router.get('/', async function (req, res, next) {
    try {
        let queries = req.query;
        let filter = {};
        if (queries.name) filter.name = new RegExp(queries.name, 'i');
        if (queries.location) filter.location = new RegExp(queries.location, 'i');

        let data = await warehouseModel.find(filter).populate({
            path: 'manager',
            select: 'username fullName email'
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* GET warehouse by ID */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await warehouseModel.findById(id).populate({
            path: 'manager',
            select: 'username fullName email'
        });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

/* POST create warehouse */
router.post('/', checkLogin, async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let newWarehouse = new warehouseModel({
            name: req.body.name,
            location: req.body.location,
            manager: req.body.manager || null,
            capacity: req.body.capacity
        });
        await newWarehouse.save({ session });
        logAction(req.user ? req.user._id : null, 'CREATE', 'warehouse', newWarehouse._id, newWarehouse, req.ip);
        await session.commitTransaction();
        res.send(newWarehouse);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({ message: error.message });
    } finally {
        session.endSession();
    }
});

/* PUT update warehouse */
router.put('/:id', checkLogin, async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let oldData = await warehouseModel.findById(id).session(session);
        let result = await warehouseModel.findByIdAndUpdate(id, req.body, { new: true, session });
        if (result) {
            logAction(req.user ? req.user._id : null, 'UPDATE', 'warehouse', id, { old: oldData, new: result }, req.ip);
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

/* DELETE warehouse */
router.delete('/:id', checkLogin, async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let result = await warehouseModel.findByIdAndDelete(id, { session });
        if (result) {
            logAction(req.user ? req.user._id : null, 'DELETE', 'warehouse', id, result, req.ip);
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
