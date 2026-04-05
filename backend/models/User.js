const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  isActive: { type: Boolean, default: true },
  // Auth fields
  loginCount: { type: Number, default: 0 },
  lockTime: { type: Date, default: null },
  forgotPasswordToken: { type: String, default: null },
  forgotPasswordTokenExp: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);