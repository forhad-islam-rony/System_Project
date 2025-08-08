import Doctor from '../models/DoctorSchema.js';
import Booking from '../models/BookingSchema.js';
import mongoose from 'mongoose';

export const updateDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    // First check if the doctor exists
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if the logged-in user is the same doctor
    if (doctor._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You're not authorized to update this profile"
      });
    }

    // Update the doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    // Update the local storage data
    const userData = { ...updatedDoctor._doc };
    
    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: userData
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update',
      error: error.message
    });
  }
};

export const deleteDoctor = async (req, res) => {
  const id = req.params.id;

  try{
    await Doctor.findByIdAndDelete(id);
    res.status(200).json({success: true, message: 'Doctor deleted successfully'});
  }
  catch(error){
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message});
  }
}

export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;

  try{
    const doctor = await Doctor.findById(id).populate("reviews").select("-password");
    res.status(200).json({success: true, message: "Doctor Found", data: doctor,});
  }
  catch(error){
    res.status(500).json({success: false, message: 'No Doctor found', error: error.message});
  }
}

export const getAllDoctor = async (req, res) => {
  try {
    const { query, specialization } = req.query;
    
    let filter = {};

    // Helper function to normalize specialization
    const normalizeSpecialization = (spec) => {
      if (!spec) return "";
      spec = spec.toLowerCase().trim();
      
      // Create base word mappings
      const baseWords = {
        'neuro': ['neurology', 'neurologist'],
        'cardio': ['cardiology', 'cardiologist'],
        'derma': ['dermatology', 'dermatologist'],
        'gastro': ['gastroenterology', 'gastroenterologist'],
        'surg': ['surgery', 'surgeon']
      };

      // Check each base word
      for (const [base, variations] of Object.entries(baseWords)) {
        if (spec.includes(base)) {
          return variations; // Return array of possible variations
        }
      }
      
      return [spec]; // Return array with original spec if no match
    };

    // Add query filter if provided
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { specialization: { $regex: query, $options: 'i' } }
      ];
    }

    // Add specialization filter if provided
    if (specialization) {
      const possibleSpecializations = normalizeSpecialization(specialization);
      filter.specialization = {
        $in: possibleSpecializations.map(s => new RegExp(s, 'i'))
      };
    }

    // Add approved filter
    filter.isApproved = "approved";

    const doctors = await Doctor.find(filter).select("-password");

    // Get appointment counts and add availability for each doctor
    const doctorsWithDetails = await Promise.all(doctors.map(async (doctor) => {
      const appointmentCount = await mongoose.model('Booking').countDocuments({
        doctor: doctor._id,
        status: { $in: ['approved', 'finished'] } // Only count completed appointments
      });

      return {
        ...doctor._doc,
        isAvailable: doctor.isAvailable || false,
        totalPatients: appointmentCount
      };
    }));

    res.status(200).json({
      success: true,
      message: "Doctors found",
      data: doctorsWithDetails
    });

  } catch (error) {
    console.error('Error in getAllDoctor:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message
    });
  }
};

export const getDoctorProfile = async (req, res) => {
  const doctorId = req.userId;
  try {
    const doctor = await Doctor.findById(doctorId).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const appointments = await Booking.find({ doctor: doctorId });
    
    res.status(200).json({
      success: true,
      message: 'Profile info retrieved successfully',
      data: { ...doctor._doc, appointments }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('-password')
      .populate('reviews')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name photo'
        }
      });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor found',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
};

// Add this new function to get doctors by specialization
export const getDoctorsBySpecialization = async (req, res) => {
  const { specialization } = req.params;

  try {
    // Create an array of possible specialization variations
    const specializationVariants = [
      specialization,
      specialization.toLowerCase(),
      specialization.toUpperCase(),
      specialization.replace('ist', 'y'), // Convert Neurologist to Neurology
      specialization.replace('y', 'ist')  // Convert Neurology to Neurologist
    ];

    const doctors = await Doctor.find({ 
      specialization: { $in: specializationVariants },
      isApproved: "approved" 
    }).select("-password");

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No doctors found with this specialization'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctors found',
      data: doctors
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error finding doctors',
      error: err.message
    });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const newDoctor = new Doctor({
      ...req.body,
      qualifications: req.body.qualifications.split(',').map(q => q.trim()),
      experiences: req.body.experiences.split(',').map(e => e.trim()),
    });

    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: newDoctor
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor',
      error: err.message
    });
  }
};

export const getTopRatedDoctors = async (req, res) => {
  try {
    // First get the top rated doctors
    const doctors = await Doctor.find({ isApproved: "approved" })
      .select("-password")
      .sort({ averageRating: -1 }) // Sort by rating in descending order
      .limit(3); // Get only top 3

    // For each doctor, get their total appointments count
    const doctorsWithCounts = await Promise.all(doctors.map(async (doctor) => {
      const appointmentCount = await mongoose.model('Booking').countDocuments({
        doctor: doctor._id,
        status: { $in: ['approved', 'finished'] } // Only count completed appointments
      });

      return {
        ...doctor.toObject(),
        totalPatients: appointmentCount
      };
    }));

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No doctors found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Top rated doctors found',
      data: doctorsWithCounts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error finding doctors',
      error: err.message
    });
  }
};

export const updateAvailability = async (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { 
        isAvailable: isAvailable 
      },
      { new: true }
    ).select("-password");

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: updatedDoctor
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: err.message
    });
  }
};