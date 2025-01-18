import jwt from 'jsonwebtoken';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';

export const authenticate = async (req, res, next) => {
    // Get token from header
    const authToken = req.headers.authorization;

    // Check if token exists
    if (!authToken || !authToken.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const token = authToken.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        req.userId = decoded.id;
        req.role = decoded.role;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
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
            return res.status(401).json({ message: "You're not authorized" });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Check if user exists and is admin
        const user = await User.findById(decoded.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}; 