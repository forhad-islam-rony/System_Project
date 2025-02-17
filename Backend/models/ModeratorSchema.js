import mongoose from "mongoose";

const ModeratorSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  division: {
    type: String,
    required: true,
    enum: [
      'Dhaka',
      'Chittagong',
      'Rajshahi',
      'Khulna',
      'Barisal',
      'Sylhet',
      'Rangpur',
      'Mymensingh'
    ]
  },
  role: {
    type: String,
    default: "moderator"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model("Moderator", ModeratorSchema); 