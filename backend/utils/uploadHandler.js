const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer lưu file tạm vào thư mục uploads
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Đặt tên file bằng thời gian hiện tại để không bị trùng
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Middleware xử lý upload file Excel
const uploadExcel = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép định dạng excel (.xlsx, .xls)
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file Excel (.xlsx, .xls)'));
    }
  }
});

// Middleware xử lý upload ảnh (lưu vào RAM để đẩy thẳng lên Cloudinary)
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh'));
    }
  }
});

module.exports = {
  uploadExcel,
  uploadImage
};
