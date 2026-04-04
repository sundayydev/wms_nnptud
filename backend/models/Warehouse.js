const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true }, // Địa chỉ kho
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Quản lý kho
  capacity: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);