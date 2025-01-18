import mongoose from "mongoose";

const patientDoctorSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    nextVisitType: {
      type: String,
      enum: ["first", "second", "free"],
      default: "first"
    },
    totalVisits: {
      type: Number,
      default: 0
    },
    history: [{
      bookingId: {
        type: mongoose.Types.ObjectId,
        ref: "Booking"
      },
      visitType: {
        type: String,
        enum: ["first", "second", "free"]
      },
      appointmentDate: Date,
      appointmentTime: String,
      problem: String,
      fee: Number,
      status: {
        type: String,
        enum: ["approved", "finished"]
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

// Create a compound index for patient and doctor
patientDoctorSchema.index({ patient: 1, doctor: 1 }, { unique: true });

export default mongoose.model("PatientDoctor", patientDoctorSchema); 