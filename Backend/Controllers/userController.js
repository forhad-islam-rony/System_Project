

import user from '../models/UserSchema.js';

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