

import Doctor from '../models/DoctorSchema.js';

export const updateDoctor = async (req, res) => {
  const id = req.params.id;

  try{
    const updateDoctor = await Doctor.findByIdAndUpdate(id, {$set:req.body}, {new: true});
    res.status(200).json({success: true, message: 'Doctor updated   successfully', data: updateDoctor});
  }
  catch(error){
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message});
  }
}


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