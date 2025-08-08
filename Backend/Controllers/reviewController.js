import Review from '../models/ReviewSchema.js';
import Doctor from '../models/DoctorSchema.js';

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId });
    
    res.status(200).json({
      success: true, 
      message: "Reviews found", 
      data: reviews
    });
  } catch (error) {
    res.status(404).json({
      success: false, 
      message: 'No reviews found', 
      error: error.message
    });
  }
}

export const createReview = async (req, res) => { 
  try {
    if(!req.body.doctor) req.body.doctor = req.params.doctorId;
    if(!req.body.user) req.body.user = req.userId;
    
    const newReview = new Review(req.body);
    await newReview.save();

    // Wait for the rating calculation to complete
    await Review.calcAverageRating(req.body.doctor);

    // Get the updated doctor data
    const updatedDoctor = await Doctor.findById(req.body.doctor)
      .select('averageRating totalRating');

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      data: newReview,
      doctor: {
        averageRating: updatedDoctor.averageRating,
        totalRating: updatedDoctor.totalRating
      }
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all platform reviews for testimonials
export const getPlatformReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      reviewType: 'platform' 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true, 
      message: "Platform reviews found", 
      data: reviews
    });
  } catch (error) {
    res.status(404).json({
      success: false, 
      message: 'No platform reviews found', 
      error: error.message
    });
  }
};

// Create platform review
export const createPlatformReview = async (req, res) => { 
  try {
    const reviewData = {
      ...req.body,
      user: req.userId,
      reviewType: 'platform'
    };
    
    const newReview = new Review(reviewData);
    await newReview.save();

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      data: newReview
    });
  } catch (error) {
    console.error("Error creating platform review:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Log the IDs to debug
    console.log('Review user ID:', review.user);
    console.log('Request user ID:', req.userId);
    
    // Convert both IDs to strings for comparison
    const reviewUserId = review.user._id ? review.user._id.toString() : review.user.toString();
    const requestUserId = req.userId.toString();
    
    console.log('Converted review user ID:', reviewUserId);
    console.log('Converted request user ID:', requestUserId);
    
    // Check if the user is the owner of the review or an admin
    if (reviewUserId !== requestUserId && req.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review'
      });
    }
    
    const doctorId = review.doctor;
    
    // Delete the review
    await Review.findByIdAndDelete(id);
    
    // Remove review from doctor's reviews array
    await Doctor.findByIdAndUpdate(doctorId, {
      $pull: { reviews: id }
    });
    
    // Recalculate ratings
    await Review.calcAverageRating(doctorId);
    
    // Get updated doctor data
    const updatedDoctor = await Doctor.findById(doctorId)
      .select('averageRating totalRating');
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      doctor: {
        averageRating: updatedDoctor.averageRating,
        totalRating: updatedDoctor.totalRating
      }
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};