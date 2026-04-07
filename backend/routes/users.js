let express = require('express')
let router = express.Router()
let userModel = require('../models/User')
let userController = require('../controllers/users')
let roleModel = require('../models/Role')
let { CreateUserValidator, ModifyUserValidator, validatedResult } = require('../utils/validator')
let { checkLogin, checkAdmin } = require('../utils/authHandler')
let mongoose = require('mongoose')

// GET all users
router.get('/', async function (req, res, next) {
    let data = await userModel.find({ isDeleted: false }).populate('role')
    res.send(data)
})

// GET user by id - admin only
router.get('/:id', checkLogin, checkAdmin, async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.find({
            isDeleted: false,
            _id: id
        }).populate('role')
        if (result.length) {
            res.send(result[0])
        } else {
            res.status(404).send({ message: "ID NOT FOUND" })
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

// POST create user - admin only
router.post('/', checkLogin, checkAdmin, CreateUserValidator, validatedResult, async function (req, res, next) {
    let session = await mongoose.startSession();
    session.startTransaction()
    try {
        let { username, password, email, role } = req.body;
        let roleExist = await roleModel.findOne({
            _id: role,
            isDeleted: false
        })
        if (!roleExist) {
            res.status(404).send({ message: "role khong ton tai" })
            return
        }
        let newUser = await userController.CreateAnUser(
            username, password, email, role, session
        )
        await session.commitTransaction()
        session.endSession()
        await newUser.populate('role')
        res.send(newUser)
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        res.status(404).send(error.message)
    }
})

// PUT update user - admin only
router.put('/:id', checkLogin, checkAdmin, ModifyUserValidator, validatedResult, async function (req, res, next) {
    try {
        let id = req.params.id;
        let userToUpdate = await userModel.findById(id);
        if (!userToUpdate) return res.status(404).send({ message: "id not found" });
        
        Object.assign(userToUpdate, req.body);
        await userToUpdate.save();

        await userToUpdate.populate('role');
        res.send(userToUpdate);
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

// DELETE soft delete user - admin only
router.delete('/:id', checkLogin, checkAdmin, async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findOne({
            isDeleted: false,
            _id: id
        })
        if (result) {
            result.isDeleted = true
            await result.save()
            res.send({ message: "Xoa thanh cong", data: result })
        } else {
            res.status(404).send({ message: "ID NOT FOUND" })
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

module.exports = router
