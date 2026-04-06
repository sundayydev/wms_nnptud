let { body, validationResult } = require('express-validator')
module.exports = {
  validatedResult: function (req, res, next) {
    let result = validationResult(req);
    if (result.errors.length > 0) {
      res.status(404).send(result.errors.map(
        function (e) {
          return {
            [e.path]: e.msg
          }
        }
      ))
    } else {
      next()
    }
  },
  CreateUserValidator: [
    body("email").notEmpty().withMessage("email khong duoc de trong").bail().isEmail().withMessage("email sai dinh dang"),
    body("username").notEmpty().withMessage("username khong duoc de trong").bail().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
    body("password").notEmpty().withMessage("password khong duoc de trong").bail().isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1
    }).withMessage("password dai it nhat 8 ki tu, trong do co it nhat 1 ki tu hoa, 1 ki tu thuong, 1 ki tu so va 1 ki tu dac biet"),
    body("role").notEmpty().withMessage("role khong duoc de trong").bail().isMongoId().withMessage("role phai la 1 id"),
    body("avatarUrl").optional().isArray().withMessage("image khong hop le"),
    body("avatarUrl.*").optional().isURL().withMessage("Url khong hop le")
  ],
  RegisterValidator: [
    body("email").notEmpty().withMessage("email khong duoc de trong").bail().isEmail().withMessage("email sai dinh dang"),
    body("username").notEmpty().withMessage("username khong duoc de trong").bail().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
    body("password").notEmpty().withMessage("password khong duoc de trong").bail().isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1
    }).withMessage("password dai it nhat 8 ki tu, trong do co it nhat 1 ki tu hoa, 1 ki tu thuong, 1 ki tu so va 1 ki tu dac biet")
  ],
  ModifyUserValidator: [
    body("email").optional().isEmail().withMessage("email sai dinh dang"),
    body("username").optional().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
    body("password").optional().isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1
    }).withMessage("password dai it nhat 8 ki tu, trong do co it nhat 1 ki tu hoa, 1 ki tu thuong, 1 ki tu so va 1 ki tu dac biet"),
    body("role").optional().isMongoId().withMessage("role phai la 1 id"),
    body("avatarUrl").optional().isArray().withMessage("image khong hop le"),
    body("avatarUrl.*").optional().isURL().withMessage("Url khong hop le")
  ],
  ChangePasswordValidator: [
    body("oldPassword").notEmpty().withMessage("mat khau cu khong duoc de trong"),
    body("newPassword").notEmpty().withMessage("mat khau moi khong duoc de trong").bail().isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1
    }).withMessage("mat khau moi dai it nhat 8 ki tu, trong do co it nhat 1 ki tu hoa, 1 ki tu thuong, 1 ki tu so va 1 ki tu dac biet")
  ]
}