let express = require('express')
let router = express.Router()
let mongoose = require('mongoose')
let roleModel = require('../models/Role')
let { checkLogin, checkAdmin } = require('../utils/authHandler')

router.get('/', checkLogin, async function (req, res, next) {
    let data = await roleModel.find({ isDeleted: false })
    res.send(data)
})

router.post('/seed', async function (req, res, next) {
    let session = await mongoose.startSession()
    session.startTransaction()
    try {
        let adminRole = await roleModel.findOne({ name: 'admin' }).session(session)
        let userRole = await roleModel.findOne({ name: 'user' }).session(session)
        let created = []
        if (!adminRole) {
            let newAdmin = new roleModel({
                name: 'admin',
                description: 'Quan tri vien he thong'
            })
            await newAdmin.save({ session })
            created.push(newAdmin)
        }
        if (!userRole) {
            let newUser = new roleModel({
                name: 'user',
                description: 'Nguoi dung thuong'
            })
            await newUser.save({ session })
            created.push(newUser)
        }
        await session.commitTransaction()
        if (created.length > 0) {
            res.send({
                message: "seed role thanh cong",
                roles: created
            })
        } else {
            res.send({ message: "roles da ton tai" })
        }
    } catch (error) {
        await session.abortTransaction()
        res.status(404).send({ message: error.message })
    } finally {
        session.endSession()
    }
})

module.exports = router
