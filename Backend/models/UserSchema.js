import mongoose from "mongoose";

/**
 * @fileoverview User Schema for patient and admin accounts in the healthcare system
 * @description Defines the database schema for users including patients and administrators
 * with blood donation tracking and appointment management capabilities
 * @author Healthcare System Team
 * @version 1.0.0
 */

/**
 * MongoDB Schema for healthcare system users (patients and admins)
 * @typedef {Object} UserSchema
 * @property {string} email - User's email address (required, unique)
 * @property {string} password - Hashed password for authentication (required)
 * @property {string} name - Full name of the user (required)
 * @property {string} phone - Contact phone number (optional)
 * @property {string} photo - Profile photo URL (optional)
 * @property {string} role - User role: patient or admin (default: patient)
 * @property {string} gender - User's gender: male, female, or other
 * @property {string} bloodType - Blood group for donation tracking
 * @property {boolean} isDonating - Blood donation availability status
 * @property {ObjectId[]} appointments - Array of appointment references
 * @property {string} district - Geographic district for location-based services
 * @property {string} location - Specific location/address within district
 */
const UserSchema = new mongoose.Schema({
  /** User's email address - used for login and communication (unique constraint) */
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  /** Hashed password for secure authentication */
  password: { 
    type: String, 
    required: true 
  },
  /** Full name of the user for identification and display */
  name: { 
    type: String, 
    required: true 
  },
  /** Contact phone number for communication and emergency contact */
  phone: { 
    type: String 
  },
  /** Profile photo URL for user avatar display */
  photo: { 
    type: String 
  },
  /** User role determining system access permissions */
  role: {
    type: String,
    enum: ["patient", "admin"], // Only patients and admins can use this schema
    default: "patient",          // Default role is patient
  },
  /** User's gender for medical record keeping and personalized care */
  gender: { 
    type: String, 
    enum: ["male", "female", "other"] 
  },
  /** Blood type for blood donation matching and emergency medical information */
  bloodType: { 
    type: String, 
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] // All major blood types
  },
  /** Flag indicating if user is available for blood donation */
  isDonating: { 
    type: Boolean, 
    default: false // Users must explicitly opt-in to blood donation
  },
  /** Array of appointment references linking to BookingSchema */
  appointments: [{ 
    type: mongoose.Types.ObjectId, 
    ref: "Appointment" 
  }],
  /** Geographic district for location-based services and blood donor search */
  district: {
    type: String,
    required: false // Optional field for location services
  },
  /** Specific location/address within the district for precise location services */
  location: {
    type: String,
    required: false // Optional field for detailed location
  }
});

/**
 * Export the User model for use in authentication and user management
 * @type {mongoose.Model<UserSchema>}
 */
export default mongoose.model("User", UserSchema);