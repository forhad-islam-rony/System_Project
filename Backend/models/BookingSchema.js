import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled", "finished"],
      default: "pending",
    },
    visitType: {
      type: String,
      enum: ["first", "second", "free"],
      default: "first"
    },
    problem: {
      type: String,
      required: true
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isNewForDoctor: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Create a compound index
bookingSchema.index({ doctor: 1, user: 1, appointmentDate: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);