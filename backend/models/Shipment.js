const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: true },
  trackingNumber: { type: String },
  carrier: { type: String },
  status: { type: String, enum: ['Preparing', 'In Transit', 'Delivered', 'Failed'], default: 'Preparing' },
  shippedDate: { type: Date },
  estimatedDelivery: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);