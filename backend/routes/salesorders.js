var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let salesorderModel = require('../models/SalesOrder');
let userModel = require('../models/User');
let notificationModel = require('../models/Notification');
let { EmitEvent } = require('../utils/socket');
let inventoryModel = require('../models/Inventory');

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

        
        if (req.body.items && req.body.items.length > 0) {
            for (let item of req.body.items) {
                let currentInv = await inventoryModel.findOne({
                    product: item.product,
                    warehouse: req.body.warehouse
                }).session(session);

                if (!currentInv || currentInv.quantity < item.quantity) {
                    throw new Error(`Kho không đủ số lượng cho mã sản phẩm, vui lòng kiểm tra lại.`);
                }

                currentInv.quantity -= item.quantity;
                await currentInv.save({ session });
            }
        }

        let shipmentModel = require('../models/Shipment');
        let newShipment = new shipmentModel({
            order: newItem._id, 
            status: 'Preparing',
            trackingNumber: `TRK-${newItem.soNumber || Date.now()}` 
        });
        await newShipment.save({ session });

        let activeUsers = await userModel.find({ isDeleted: false }).select('_id');
        let notificationData = activeUsers.map(function (user) {
            return {
                recipient: user._id,
                sender: newItem.createdBy || null,
                title: 'Đơn hàng mới vừa được tạo',
                content: `Đơn hàng ${newItem.soNumber} vừa được tạo với tổng tiền ${newItem.totalAmount}`,
                type: 'sales-order-created',
                referenceModel: 'SalesOrder',
                referenceId: newItem._id,
                isRead: false,
                isDeleted: false
            };
        });
        if (notificationData.length) {
            await notificationModel.insertMany(notificationData, { session });
        }

        await session.commitTransaction();
        EmitEvent('sales-order-created', {
            _id: newItem._id,
            soNumber: newItem.soNumber,
            customer: newItem.customer,
            warehouse: newItem.warehouse,
            totalAmount: newItem.totalAmount,
            status: newItem.status,
            createdAt: newItem.createdAt
        });
        EmitEvent('notification-created', {
            type: 'sales-order-created',
            referenceId: newItem._id,
            recipientIds: activeUsers.map(function (user) {
                return user._id.toString();
            })
        });
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
