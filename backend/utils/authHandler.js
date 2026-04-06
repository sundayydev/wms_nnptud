let jwt = require('jsonwebtoken')
let userController = require("../controllers/users")
module.exports = {
    checkLogin: async function (req, res, next) {
        try {
            let token = req.headers.authorization;
            if (!token || !token.startsWith('Bearer')) {
                return res.status(401).send({ message: "Mã xác thực (Token) không hợp lệ hoặc không được gửi kèm." });
            }
            token = token.split(" ")[1];
            let result = jwt.verify(token, "secret");
            if (result.exp * 1000 > Date.now()) {
                let user = await userController.FindUserById(result.id);
                if (user) {
                    req.user = user;
                    next();
                } else {
                    res.status(401).send({ message: "Tài khoản không tồn tại trên hệ thống." });
                }
            } else {
                res.status(401).send({ message: "Phiên đăng nhập đã hết hạn!" });
            }
        } catch (error) {
            res.status(401).send({ message: "Lỗi xác thực: " + error.message });
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