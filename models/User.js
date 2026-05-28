const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },

  fullName: {
    type: String,
    trim: true
  },

  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },

  password: { 
    type: String, 
    required: true 
  },

  role: { 
    type: String,
    enum: ['student', 'mentor'],
    default: 'student'
  },

  educationLevel: { 
    type: String, 
    trim: true 
  },

  skills: [{ 
    type: String, 
    trim: true 
  }],

  careerGoal: { 
    type: String, 
    trim: true 
  },

  profileCompleted: {
    type: Boolean,
    default: false
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);