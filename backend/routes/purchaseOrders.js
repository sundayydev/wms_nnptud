var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let purchaseOrderModel = require('../models/PurchaseOrder');

// Lấy tất cả
router.get('/', async function (req, res, next) {
    try {
        let queries = req.query;
        let filter = {};

        if (queries.poNumber) filter.poNumber = new RegExp(queries.poNumber, 'i');
        if (queries.status) filter.status = queries.status;
        if (queries.supplier) filter.supplier = queries.supplier;
        if (queries.warehouse) filter.warehouse = queries.warehouse;

        let data = await purchaseOrderModel.find(filter);

        res.send(data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Lấy theo id
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await purchaseOrderModel.findById(id);

        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: 'ID NOT FOUND' });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// tạo 1 đơn hàng mới
router.post('/', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let newPurchaseOrder = new purchaseOrderModel({
            poNumber: req.body.poNumber,
            supplier: req.body.supplier,
            warehouse: req.body.warehouse,
            items: req.body.items,
            totalAmount: req.body.totalAmount,
            status: req.body.status,
            createdBy: req.body.createdBy
        });

        await newPurchaseOrder.save({ session });

        // Tự động cộng tồn kho (Inventory)
        let inventoryModel = require('../models/Inventory');
        if (req.body.items && req.body.items.length > 0) {
            for (let item of req.body.items) {
                let currentInv = await inventoryModel.findOne({
                    product: item.product,
                    warehouse: req.body.warehouse
                }).session(session);

                if (currentInv) {
                    currentInv.quantity += item.quantity;
                    await currentInv.save({ session });
                } else {
                    let newInv = new inventoryModel({
                        product: item.product,
                        warehouse: req.body.warehouse,
                        quantity: item.quantity,
                        lastUpdatedBy: req.body.createdBy
                    });
                    await newInv.save({ session });
                }
            }
        }

        let result = await purchaseOrderModel.findById(newPurchaseOrder._id).session(session);

        await session.commitTransaction();
        res.send(result);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({ message: error.message });
    } finally {
        session.endSession();
    }
});

// Cập nhật đơn hàng
router.put('/:id', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let result = await purchaseOrderModel.findByIdAndUpdate(id, req.body, { new: true, session });

        if (result) {
            await session.commitTransaction();
            res.send(result);
        } else {
            await session.abortTransaction();
            res.status(404).send({ message: 'ID NOT FOUND' });
        }
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({ message: error.message });
    } finally {
        session.endSession();
    }
});

// Xóa đơn hàng
router.delete('/:id', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let result = await purchaseOrderModel.findByIdAndDelete(id, { session });

        if (result) {
            await session.commitTransaction();
            res.send({ message: 'Deleted successfully', data: result });
        } else {
            await session.abortTransaction();
            res.status(404).send({ message: 'ID NOT FOUND' });
        }
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({ message: error.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;
