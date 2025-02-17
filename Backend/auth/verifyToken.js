import jwt from 'jsonwebtoken';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authorization header missing or invalid format' 
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Add user ID to request
    req.userId = decoded.id;
    req.role = decoded.role;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const restrict = roles => async (req, res, next) => {
  const userId = req.userId;

  try {
    let user;
    
    const patient = await User.findById(userId);
    const doctor = await Doctor.findById(userId);

    if (patient) {
      user = patient;
    }
    if (doctor) {
      user = doctor;
    }

    if (!roles.includes(user.role)) {
      return res.status(401).json({ success: false, message: "You're not authorized" });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
