let userModel = require('../models/User')
module.exports = {
    CreateAnUser: async function (username, password, email, role, session) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            role: role
        })
        await newUser.save({ session })
        return newUser
    },
    FindUserByUsername: async function (username) {
        return await userModel.findOne({
            username: username,
            isDeleted: false
        }).populate('role')
    },
    FindUserByEmail: async function (email) {
        return await userModel.findOne({
            email: email,
            isDeleted: false
        })
    },
    FindUserById: async function (id) {
        return await userModel.findOne({
            _id: id,
            isDeleted: false
        }).populate('role')
    },
    FindUserByToken: async function (token) {
        return await userModel.findOne({
            forgotPasswordToken: token,
            isDeleted: false
        })
    }
}
