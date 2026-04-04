const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, required: true, default: 0, min: 0 }, // Số lượng tồn
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Mỗi sản phẩm trong một kho chỉ có 1 bản ghi tồn kho
inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);