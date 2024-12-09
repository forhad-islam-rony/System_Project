import fwt from 'jsonwebtoken';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';

export const authenticate = async (req, res, next) => {

  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith('Bearer')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const token = authToken.split(' ')[1];
    const decoded = fwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // console.log(decoded);

    req.userId = decoded.iid;
    req.role = decoded.role;
    // console.log(req.userId);
    // console.log(req.role);

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session Expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid Token' });
  }
};

export const restrict = (roles) => async (req, res, next) => {
  const userId = req.userId;
  // console.log("Decoded userId:", userId);

  try {
    const patient = await User.findById(userId); 
    const doctor = await Doctor.findById(userId);

    // console.log("Patient:", patient);
    // console.log("Doctor:", doctor);

    const user = patient || doctor;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // console.log("User role:", user.role);

    if (!roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'You are not authorized' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
