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
    const { email, password } = req.body;

    try {
        let user = null;
        const patient = await User.findOne({ email });
        const doctor = await Doctor.findOne({ email });

        if (patient) {
            user = patient;
        } else if (doctor) {
            user = doctor;
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '15d' }
        );

        const { password: userPassword, ...rest } = user._doc;

        // Send response with token and user data
        res.status(200).json({
            status: true,
            message: 'Successfully logged in',
            token,
            data: { ...rest },
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Failed to login' });
    }
};