var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let inventoryModel = require('../models/Inventory');
let userModel = require('../models/User');
let roleModel = require('../models/Role');
let { sendLowStockMail } = require('../utils/mailHandler');
let { logAction } = require('../utils/auditlogHandler');
require('../models/Product');
require('../models/Warehouse');
require('../models/User');

const LOW_STOCK_THRESHOLD = 10; // ngưỡng cảnh báo tồn kho

/* GET all inventories */
router.get('/', async function (req, res, next) {
    try {
        let queries = req.query;
        let filter = {};
        if (queries.warehouse) filter.warehouse = queries.warehouse;
        if (queries.product) filter.product = queries.product;

        let data = await inventoryModel.find(filter)
            .populate('product')
            .populate('warehouse')
            .populate({ path: 'lastUpdatedBy', select: 'username email' });
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* GET danh sách tồn kho thấp + tự gửi mail cảnh báo cho admin */
router.get('/low-stock', async function (req, res, next) {
    try {
        let lowStockItems = await inventoryModel.find({ quantity: { $lt: LOW_STOCK_THRESHOLD } })
            .populate('product')
            .populate('warehouse');

        if (lowStockItems.length > 0) {
            // Lấy email tất cả admin
            let adminRole = await roleModel.findOne({ name: 'admin', isDeleted: false });
            if (adminRole) {
                let admins = await userModel.find({ role: adminRole._id, isDeleted: false });
                for (let admin of admins) {
                    for (let item of lowStockItems) {
                        await sendLowStockMail(
                            admin.email,
                            item.product?.name || 'Không xác định',
                            item.warehouse?.name || 'Không xác định',
                            item.quantity
                        );
                    }
                }
            }
        }

        res.send({
            total: lowStockItems.length,
            threshold: LOW_STOCK_THRESHOLD,
            data: lowStockItems
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* GET inventory by ID */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findById(id)
            .populate('product')
            .populate('warehouse');
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

/* POST create inventory */
router.post('/', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let exists = await inventoryModel.findOne({
            product: req.body.product,
            warehouse: req.body.warehouse
        }).session(session);

        if (exists) {
            await session.abortTransaction();
            return res.status(400).send({ message: "Sản phẩm này đã có dữ liệu tồn kho trong kho được chọn. Vui lòng sử dụng tính năng cập nhật." });
        }

        let newInventory = new inventoryModel({
            product: req.body.product,
            warehouse: req.body.warehouse,
            quantity: req.body.quantity,
            lastUpdatedBy: req.body.lastUpdatedBy || null
        });
        await newInventory.save({ session });
        await session.commitTransaction();
        res.send(newInventory);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({ message: error.message });
    } finally {
        session.endSession();
    }
});

/* PUT update inventory - ghi audit log + gửi mail nếu tồn kho thấp */
router.put('/:id', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;

        // Lấy số lượng cũ trước khi update
        let oldData = await inventoryModel.findById(id)
            .populate('product')
            .populate('warehouse')
            .session(session);

        if (!oldData) {
            await session.abortTransaction();
            return res.status(404).send({ message: "ID NOT FOUND" });
        }
        let quantityBefore = oldData.quantity;

        let result = await inventoryModel.findByIdAndUpdate(id, {
            quantity: req.body.quantity,
            lastUpdatedBy: req.body.lastUpdatedBy || null
        }, { returnDocument: 'after', session }).populate('product').populate('warehouse');

        // Ghi audit log — ai cập nhật, số lượng cũ → mới
        logAction(
            req.body.lastUpdatedBy || null,
            'UPDATE',
            'inventory',
            result._id,
            {
                product: result.product?.name,
                warehouse: result.warehouse?.name || 'Không xác định',
                quantityBefore: quantityBefore,
                quantityAfter: result.quantity
            },
            req.ip
        );

        await session.commitTransaction();

        // Kiểm tra ngưỡng tồn kho → gửi mail cảnh báo (ngoài transaction)
        if (result.quantity < LOW_STOCK_THRESHOLD) {
            console.log(`[LOW STOCK] quantity=${result.quantity} < threshold=${LOW_STOCK_THRESHOLD} → tìm admin...`);
            let adminRole = await roleModel.findOne({ name: 'admin', isDeleted: false });
            console.log(`[LOW STOCK] adminRole:`, adminRole?._id);
            if (adminRole) {
                let admins = await userModel.find({ role: adminRole._id, isDeleted: false });
                console.log(`[LOW STOCK] số admin tìm được: ${admins.length}`, admins.map(a => a.email));
                for (let admin of admins) {
                    await sendLowStockMail(
                        admin.email,
                        result.product?.name || 'Không xác định',
                        result.warehouse?.name || 'Không xác định',
                        result.quantity
                    );
                }
            }
        }

        res.send(result);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).send({ message: error.message });
    } finally {
        session.endSession();
    }
});

/* DELETE inventory */
router.delete('/:id', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.params.id;
        let result = await inventoryModel.findByIdAndDelete(id, { session });
        if (result) {
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
