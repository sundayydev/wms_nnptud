const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true }, // Mã sản phẩm
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  imagePublicId: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true } // Đơn vị tính: Cái, Hộp, Kg...
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);