let mongoose = require('mongoose')
let bcrypt = require('bcrypt')
let userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: [true, "username khong duoc trung"]
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: [true, "email khong duoc trung"]
  },
  fullName: {
    type: String
  },
  role: {
    type: mongoose.Types.ObjectId,
    ref: 'role',
    required: true
  },
  avatarUrl: {
    type: [String]
  },
  status: {
    type: String,
    default: 'active'
  },
  loginCount: {
    type: Number,
    default: 0
  },
  lockTime: {
    type: Date,
    default: null
  },
  forgotPasswordToken: {
    type: String,
    default: null
  },
  forgotPasswordTokenExp: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

userSchema.pre('save', function () {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10)
  }
})

module.exports = new mongoose.model('user', userSchema)
