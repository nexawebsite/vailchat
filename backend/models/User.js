const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  avatar: {
    type: String,
    default: ''
  },
  wallpaper: {
    type: String,
    default: ''
  },
  contacts: [{
    phoneNumber: { type: String, required: true },
    name: { type: String, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
