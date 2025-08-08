import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  photo: { type: String },
  gender: { type: String, enum: ["male", "female", "other"] },
  ticketPrice: { type: Number },
  role: {
    type: String,
    default: "doctor",
  },

  // Fields for doctors only
  specialization: { type: String },
  qualifications: {
    type: Array,
  },

  experiences: {
    type: Array,
  },

  bio: { type: String, maxLength: 50 },
  about: { type: String },
  timeSlots: {
    type: [String],  // Array of strings
    required: true
  },
  reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRating: {
    type: Number,
    default: 0,
    min: 0
  },
  isApproved: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  appointments: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
});

// Virtual field for total patients (unique patients from appointments)
DoctorSchema.virtual('totalPatients').get(function() {
  return this.appointments ? this.appointments.length : 0;
});

// Ensure virtuals are included when converting document to JSON
DoctorSchema.set('toJSON', { virtuals: true });
DoctorSchema.set('toObject', { virtuals: true });

export default mongoose.model("Doctor", DoctorSchema);