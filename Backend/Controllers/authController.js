
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = user => {
  return jwt.sign({iid:user._id, role:user.role}, process.env.JWT_SECRET_KEY, {
    expiresIn: '90d'
  })

}

export const register = async (req, res) => {

  const { email, password, name, role, photo, gender } = req.body;
  try{
      let user = null;
      
      if(role =="patient"){
        user = await User.findOne({email})
      }
      else if(role=="doctor"){
        user = await Doctor.findOne({email})
  }

  if(user){
    return res.status(400).json({message: 'User already exists'});
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  if(role=='patient'){
    user = new User({name, email, password: hashedPassword, role, photo, gender });
  }

  if(role=='doctor'){
    user = new Doctor({name,email, password: hashedPassword,role, photo, gender, });
  }
  await user.save();
  res.status(200).json({success: true, message: 'User created  successfully'});


}

  catch(error){
      res.status(500).json({success: false, message: 'Something went wrong', error: error.message});
  }
}

export const login = async (req, res) => {
  const {email} = req.body;
  try{
    let user = null;
    const patient = await User.findOne({email});
    const doctor = await Doctor.findOne({email});

    if(patient){
      user = patient;
    }
    else if(doctor){
      user = doctor
  }

  if(!user){
    return res.status(404).json({message: 'User not found'});
  }

  const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);

  if(!isPasswordMatch){
    return res.status(400).json({ status: false, message: 'Invalid credentials'});
  }

const token = generateToken(user);

const {paswoord, role, ...rest} = user._doc;
res.status(200).json({status: true, message: "Successfully Login", token, date:{...rest}, role});

}
  catch(error){
    res.status(500).json({status: false, message: 'Something went wrong', error:  error.message});
  }
}