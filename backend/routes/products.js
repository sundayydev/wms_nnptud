var express = require('express');
var router = express.Router();
let productModel = require('../models/Product')
let inventoryModel = require('../models/Inventory')
let mongoose = require('mongoose')

/* GET all products */
router.get('/', async function (req, res, next) {
    let queries = req.query;
    let nameQ = queries.name ? queries.name : '';
    let max = queries.max ? Number(queries.max) : 10000;
    let min = queries.min ? Number(queries.min) : 0;
    let filter = {
        price: { $gte: min, $lte: max }
    };
    if (nameQ) filter.name = new RegExp(nameQ, 'i');

    let data = await productModel.find(filter).populate({
        path: 'category',
        select: 'name'
    });
    res.send(data);
});

/* GET product by ID */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await productModel.findById(id).populate('category');
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

/* POST create product */
router.post('/', async function (req, res) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let newProduct = new productModel({
            sku: req.body.sku,
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            unit: req.body.unit
        });
        await newProduct.save({ session });
        let newInventory = new inventoryModel({
            product: newProduct._id,
            warehouse: req.body.warehouse,
            quantity: req.body.quantity || 0
        });
        await newInventory.save({ session });
        await newInventory.populate('product');
        await session.commitTransaction();
        await session.endSession();
        res.send({ product: newProduct, inventory: newInventory });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.status(400).send({ message: error.message });
    }
});

/* PUT update product */
router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await productModel.findByIdAndUpdate(id, req.body, { new: true });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

/* DELETE product */
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await productModel.findByIdAndDelete(id);
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
