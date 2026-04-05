let express = require('express')
let router = express.Router()
let roleModel = require('../schemas/roles')
let { checkLogin, checkAdmin } = require('../utils/authHandler')

// GET all roles
router.get('/', checkLogin, async function (req, res, next) {
    let data = await roleModel.find({ isDeleted: false })
    res.send(data)
})

// POST seed - tao 2 role admin va user
router.post('/seed', async function (req, res, next) {
    try {
        let adminRole = await roleModel.findOne({ name: 'admin' })
        let userRole = await roleModel.findOne({ name: 'user' })
        let created = []
        if (!adminRole) {
            let newAdmin = new roleModel({
                name: 'admin',
                description: 'Quan tri vien he thong'
            })
            await newAdmin.save()
            created.push(newAdmin)
        }
        if (!userRole) {
            let newUser = new roleModel({
                name: 'user',
                description: 'Nguoi dung thuong'
            })
            await newUser.save()
            created.push(newUser)
        }
        if (created.length > 0) {
            res.send({
                message: "seed role thanh cong",
                roles: created
            })
        } else {
            res.send({ message: "roles da ton tai" })
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

module.exports = router
