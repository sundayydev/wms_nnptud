const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  customerType: { type: String, enum: ['Retail', 'Wholesale'], default: 'Retail' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);