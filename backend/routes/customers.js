var express = require('express');
var router = express.Router();
let customerModel = require('../schemas/customers')
let { logAction } = require('../utils/auditlogHandler')
let { checkLogin } = require('../utils/authHandler')

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
            res.send(result[0])
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});
router.post('/', checkLogin, async function (req, res) {
    try {
        let newCustomer = new customerModel({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            customerType: req.body.customerType
        })
        await newCustomer.save()
        logAction(req.user ? req.user._id : null, 'CREATE', 'customer', newCustomer._id, newCustomer, req.ip)
        res.send(newCustomer)
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
})
router.put('/:id', checkLogin, async function (req, res) {
    try {
        let id = req.params.id;
        let oldData = await customerModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (!oldData) {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
            return
        }
        let result = await customerModel.findByIdAndUpdate(
            id, req.body, {
            new: true
        })
        logAction(req.user ? req.user._id : null, 'UPDATE', 'customer', id, { old: oldData, new: result }, req.ip)
        res.send(result)
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})
router.delete('/:id', checkLogin, async function (req, res) {
    try {
        let id = req.params.id;
        let result = await customerModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            result.isDeleted = true
            await result.save();
            logAction(req.user ? req.user._id : null, 'DELETE', 'customer', id, result, req.ip)
            res.send(result)
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

module.exports = router;
