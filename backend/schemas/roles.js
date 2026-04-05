let mongoose = require('mongoose')
let roleSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: [true, "ten role khong duoc trung"],
    enum: ['admin', 'user']
  },
  description: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})
module.exports = new mongoose.model('role', roleSchema)
