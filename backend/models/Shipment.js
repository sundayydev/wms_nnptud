const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: true }, // Có thể mở rộng ref đến PurchaseOrder nếu cần quản lý vận chuyển nhập
  trackingNumber: { type: String },
  carrier: { type: String }, // Đơn vị vận chuyển (VD: VNPost, GHN)
  status: { type: String, enum: ['Preparing', 'In Transit', 'Delivered', 'Failed'], default: 'Preparing' },
  shippedDate: { type: Date },
  estimatedDelivery: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);