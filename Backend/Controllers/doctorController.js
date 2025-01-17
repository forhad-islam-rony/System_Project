import Doctor from '../models/DoctorSchema.js';
import Booking from '../models/BookingSchema.js';

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

  try{

    const {query} = req.query;
    let doctors;
    if(query){
      doctors = await Doctor.find({isApproved: 'approved', $or:[{name:{$regex: query, $option: "i"}},
        {specialization:{$regex: query, $option: "i"}},
      ],
      }).select("-password");
    }
    else{
       doctors = await Doctor.find({isApproved: "approved"}).select("-password");
    }
    res.status(200).json({success: true, message: "All Doctor Found", data: doctors,});
  }
  catch(error){
    res.status(500).json({success: false, message: 'No Doctors found', error: error.message});
  }
}

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