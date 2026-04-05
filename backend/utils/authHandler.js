let jwt = require('jsonwebtoken')
let userController = require("../controllers/users")
module.exports = {
    checkLogin: async function (req, res, next) {
        try {
            let token = req.headers.authorization;
            if (!token || !token.startsWith('Bearer')) {
                res.status(404).send("ban chua dang nhap")
                return
            }
            token = token.split(" ")[1];
            let result = jwt.verify(token, "secret");
            if (result.exp * 1000 > Date.now()) {
                let user = await userController.FindUserById(result.id);
                if (user) {
                    req.user = user
                    next()
                } else {
                    res.status(404).send("ban chua dang nhap")
                }
            } else {
                res.status(404).send("ban chua dang nhap")
            }
        } catch (error) {
            res.status(404).send("ban chua dang nhap")
        }
    },
    checkAdmin: async function (req, res, next) {
        if (req.user && req.user.role && req.user.role.name == 'admin') {
            next()
        } else {
            res.status(403).send("ban khong co quyen truy cap")
        }
    }
}