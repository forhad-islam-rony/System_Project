import user from '../models/UserSchema.js';
import BookingSchema from '../models/BookingSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Booking from '../models/BookingSchema.js';
import PatientDoctor from '../models/PatientDoctorSchema.js';

export const updateUser = async (req, res) => {
  const id = req.params.id;

  try{
    const updateUser = await user.findByIdAndUpdate(id, {$set:req.body}, {new: true});
    res.status(200).json({success: true, message: 'User updated   successfully', data: updateUser});
  }
  catch(error){
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message});
  }
}


export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try{
    await user.findByIdAndDelete(id);
    res.status(200).json({success: true, message: 'User deleted successfully'});
  }
  catch(error){
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message});
  }
}


export const getSingleUser = async (req, res) => {
  const id = req.params.id;

  try{
    const User = await user.findById(id).select("-password");
    res.status(200).json({success: true, message: "User Found", data: User,});
  }
  catch(error){
    res.status(500).json({success: false, message: 'No user found', error: error.message});
  }
}

export const getAllUser = async (req, res) => {

  try{
    const users = await user.find().select("-password");
    res.status(200).json({success: true, message: "All User Found", data: users,});
  }
  catch(error){
    res.status(500).json({success: false, message: 'No users found', error: error.message});
  }
}

export const getUserProfile = async (req, res) => {
  const userId = req.userId
  try{
    const user = await user.findById(userId);

    if(!user){
      return res.status(404).json({success: false, message: 'User not found'});
    }

    const {password, ...rest} = user._doc;
    res.status(200).json({success: true, message: 'User found successfully', data: {...rest}});
  }
  catch(error){
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message});
  }
}

export const getMyAppointments = async (req, res) => {
  try {
    // Get both current bookings and history
    const bookings = await Booking.find({ user: req.userId })
      .populate('doctor', 'name specialization');

    const patientDoctorRecords = await PatientDoctor.find({ 
      patient: req.userId 
    }).populate('doctor', 'name specialization');

    // Combine and format the data
    const allAppointments = [
      ...bookings,
      ...patientDoctorRecords.flatMap(record => 
        record.history.map(hist => ({
          ...hist,
          doctor: record.doctor,
          status: 'finished'
        }))
      )
    ].sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: allAppointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message
    });
  }
};

// Get current bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      user: req.userId,
      status: { $ne: 'finished' }  // Exclude finished appointments
    }).populate('doctor', 'name specialization photo');

    res.status(200).json({
      success: true,
      message: "Current bookings fetched successfully",
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch current bookings",
      error: error.message
    });
  }
};

// Get booking history from PatientDoctor
export const getBookingHistory = async (req, res) => {
  try {
    const patientDoctorRecords = await PatientDoctor.find({ 
      patient: req.userId 
    }).populate('doctor', 'name specialization photo');

    // Extract and flatten all history entries
    const history = patientDoctorRecords.flatMap(record => 
      record.history.map(hist => ({
        ...hist.toObject(),
        doctor: record.doctor
      }))
    ).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    res.status(200).json({
      success: true,
      message: "Booking history fetched successfully",
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking history",
      error: error.message
    });
  }
};