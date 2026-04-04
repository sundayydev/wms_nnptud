const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // VD: CREATE, UPDATE, DELETE
  collectionName: { type: String, required: true }, // Tên model bị thay đổi (VD: Product, Inventory)
  documentId: { type: mongoose.Schema.Types.ObjectId }, // ID của record bị tác động
  changes: { type: mongoose.Schema.Types.Mixed }, // Lưu trữ dữ liệu cũ/mới dưới dạng JSON linh hoạt
  ipAddress: { type: String }
}, { timestamps: true }); // Tự động có createdAt để biết thời gian thao tác

module.exports = mongoose.model('AuditLog', auditLogSchema);