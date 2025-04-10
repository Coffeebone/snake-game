// server/models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String
  },
  highScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);