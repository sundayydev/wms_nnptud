var express = require('express');
var router = express.Router();
let inventoryModel = require('../models/Inventory');
require('../models/Product');
require('../models/Warehouse');
require('../models/User');

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
    try {
        // Kiểm tra xem đã có tồn kho cho sản phẩm này ở kho này chưa
        let exists = await inventoryModel.findOne({ product: req.body.product, warehouse: req.body.warehouse });
        if (exists) {
            return res.status(400).send({ message: "Sản phẩm này đã có dữ liệu tồn kho trong kho được chọn. Vui lòng sử dụng tính năng cập nhật." });
        }

        let newInventory = new inventoryModel({
            product: req.body.product,
            warehouse: req.body.warehouse,
            quantity: req.body.quantity,
            lastUpdatedBy: req.body.lastUpdatedBy || null
        });
        await newInventory.save();
        res.send(newInventory);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

/* PUT update inventory */
router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findByIdAndUpdate(id, {
            quantity: req.body.quantity,
            lastUpdatedBy: req.body.lastUpdatedBy || null
        }, { new: true });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

/* DELETE inventory */
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findByIdAndDelete(id);
        if (result) {
            res.send({ message: "Deleted successfully", data: result });
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
