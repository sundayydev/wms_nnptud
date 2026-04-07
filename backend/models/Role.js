const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // VD: Admin, Warehouse_Staff, Accountant
  description: { type: String },
  permissions: [{ type: String }], // Danh sách các quyền (VD: 'read_product', 'write_order')
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);