let multer = require('multer')
let path = require('path')
let fs = require('fs')

// Tạo folder upload nếu chưa tồn tại (Dành cho Excel)
let uploadDirectory = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true })
}

// luu o dau, luu ten la gi? file->req->save->xu ly
let storageSetting = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname)
        let namefile = Date.now() + "-" + Math.round(Math.random() * 2E9) + ext;
        cb(null, namefile)
    },
})

let filterImage = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new Error("file sai dinh dang"))
    }
}

let filterExcel = function (req, file, cb) {
    if (file.mimetype.includes('spreadsheetml') || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true)
    } else {
        cb(new Error("file sai dinh dang"))
    }
}

module.exports = {
    // Để đẩy ảnh lên Cloudinary chuẩn xác, ta bắt buộc phải dùng buffer (memoryStorage) thay vì lưu xuống ổ cứng
    uploadImage: multer({
        storage: multer.memoryStorage(), 
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: filterImage
    }),
    
    // Còn Excel thì cứ lưu vào máy như cũ bằng storageSetting
    uploadExcel: multer({
        storage: storageSetting,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: filterExcel
    })
}
