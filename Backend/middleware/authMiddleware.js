import jwt from 'jsonwebtoken';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';

export const authenticate = async (req, res, next) => {
    // Get token from header
    const authToken = req.headers.authorization;

    // Check if token exists
    if (!authToken || !authToken.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token, authorization denied'
        });
    }

    try {
        // Verify token
        const token = authToken.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Add user info to request
        req.userId = decoded.id;
        req.role = decoded.role;
        req.division = decoded.division;

        console.log('Auth Middleware - Division:', decoded.division);

        next();
    } catch (error) {
        console.error('Auth Error:', error);
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
            return res.status(401).json({ message: "You're not authorized" });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyAdmin = async (req, res, next) => {
    try {
        console.log('Verifying admin access...');
        const authToken = req.headers.authorization;

        if (!authToken || !authToken.startsWith('Bearer ')) {
            console.log('No token provided');
            return res.status(401).json({ 
                success: false, 
                message: 'No token, authorization denied' 
            });
        }

        const token = authToken.split(' ')[1];
        console.log('Token received');

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('Token decoded:', decoded);

        const user = await User.findById(decoded.id);
        console.log('User found:', user?.role);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized as admin' 
            });
        }

        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    } catch (err) {
        console.error('Admin verification error:', err);
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
}; 