

import user from '../models/UserSchema.js';
import BookingSchema from '../models/BookingSchema.js';
import Doctor from '../models/DoctorSchema.js';

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

export const getMyAppointment = async (req, res) => { 
  try{
     //step-1 : retrives appointment from booking
       const bookings = await BookingSchema.find({user: req.userId});
     //step-2 : extract doctor id from appointment booking
     const doctorIds = bookings.map(el => el.doctor.id);

     // step-3 : retrive doctors using doctor ids

     const doctors = await Doctor.find({_id: {$in: doctorIds}}).select("-password"); 
    res.status(200).json({success: true, message: 'Appointments are getting', data: doctors});
    
  }
  catch(error){
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message});
  }
}