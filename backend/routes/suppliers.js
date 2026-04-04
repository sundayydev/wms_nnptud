var express = require('express');
var router = express.Router();
let supplierModel = require('../models/Supplier')

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
    try {
        let newSupplier = new supplierModel({
            name: req.body.name,
            contactPerson: req.body.contactPerson,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address
        });
        await newSupplier.save();
        res.send(newSupplier);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

/* PUT update supplier */
router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await supplierModel.findByIdAndUpdate(id, req.body, { new: true });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

/* DELETE supplier */
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await supplierModel.findByIdAndDelete(id);
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
