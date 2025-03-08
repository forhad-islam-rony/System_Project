import mongoose from "mongoose";
import Doctor from "./DoctorSchema.js";

const reviewSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ 
    path : "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (doctorId) {
  try {
    // Convert string ID to ObjectId if needed
    const docId = new mongoose.Types.ObjectId(doctorId);
    
    const stats = await this.aggregate([
      {
        $match: { doctor: docId }  // Make sure we're matching with ObjectId
      },
      {
        $group: {
          _id: "$doctor",
          nRating: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    console.log("Aggregation stats:", stats);

    if (stats.length > 0) {
      await Doctor.findByIdAndUpdate(doctorId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
        totalRating: stats[0].nRating
      }, { new: true });
    } else {
      await Doctor.findByIdAndUpdate(doctorId, {
        averageRating: 0,
        totalRating: 0
      }, { new: true });
    }
  } catch (error) {
    console.error("Error calculating average rating:", error);
  }
};

// Make sure this gets called after saving a review
reviewSchema.post('save', async function() {
  await this.constructor.calcAverageRating(this.doctor);
});

// Also add this to handle review updates/deletions
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.doctor);
  }
});

export default mongoose.model("Review", reviewSchema);