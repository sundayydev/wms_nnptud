const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  email: { type: String, required: true, unique: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  isActive: { type: Boolean, default: true },
  avatarUrl: { type: [String] },
  status: { type: String, default: 'active' },
  isDeleted: { type: Boolean, default: false },
  // Auth fields
  loginCount: { type: Number, default: 0 },
  lockTime: { type: Date, default: null },
  forgotPasswordToken: { type: String, default: null },
  forgotPasswordTokenExp: { type: Date, default: null },
}, { timestamps: true });

userSchema.pre('save', function () {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
});

module.exports = mongoose.model('User', userSchema);