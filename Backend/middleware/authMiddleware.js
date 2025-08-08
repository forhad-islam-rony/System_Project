/**
 * @fileoverview Authentication Middleware for Healthcare System
 * @description JWT-based authentication and authorization middleware for protecting routes
 * and managing role-based access control (patient, doctor, admin, moderator)
 * @author Healthcare System Team
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';

/**
 * Authenticate user requests using JWT tokens
 * @async
 * @function authenticate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() on success, sends error response on failure
 * @description Validates JWT token from Authorization header and extracts user information.
 * Adds userId, role, and division to the request object for use in subsequent middleware.
 */
export const authenticate = async (req, res, next) => {
    // Extract JWT token from Authorization header (format: "Bearer <token>")
    const authToken = req.headers.authorization;
    console.log('Auth Middleware - Token:', authToken ? 'Token provided' : 'No token');

    // Validate that token exists and follows Bearer token format
    if (!authToken || !authToken.startsWith('Bearer ')) {
        console.log('Auth Middleware - Authentication failed: No bearer token');
        return res.status(401).json({
            success: false,
            message: 'No token, authorization denied'
        });
    }

    try {
        // Extract token from "Bearer <token>" format and verify with JWT secret
        const token = authToken.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('Auth Middleware - User authenticated:', { id: decoded.id, role: decoded.role, division: decoded.division });

        // Attach user information to request object for use in route handlers
        req.userId = decoded.id;           // User's database ID
        req.role = decoded.role;           // User's role (patient, doctor, admin, moderator)
        req.division = decoded.division;   // Geographic division (for moderators)

        // Continue to next middleware or route handler
        next();
    } catch (error) {
        // Handle token verification failures (expired, invalid, malformed)
        console.error('Auth Middleware - Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

/**
 * Alias for backward compatibility with older route definitions
 * @function protect
 * @description Legacy alias for authenticate function
 */
export const protect = authenticate;

/**
 * Role-based access control middleware
 * @function restrict
 * @param {string[]} roles - Array of allowed roles for the route
 * @returns {Function} Express middleware function
 * @description Creates a middleware function that restricts access to specified user roles.
 * Works with both User and Doctor collections to check role permissions.
 * @example
 * // Only allow admins and doctors to access this route
 * router.get('/sensitive-data', authenticate, restrict(['admin', 'doctor']), handler);
 */
export const restrict = roles => async (req, res, next) => {
    // Get user ID from the authentication middleware
    const userId = req.userId;

    try {
        let user;
        
        // Check both User and Doctor collections since roles span multiple collections
        const patient = await User.findById(userId);  // Check patients and admins
        const doctor = await Doctor.findById(userId); // Check doctors

        // Determine which collection contains the user
        if (patient) {
            user = patient;
        }
        if (doctor) {
            user = doctor;
        }

        // Verify that the user's role is in the allowed roles array
        if (!roles.includes(user.role)) {
            return res.status(401).json({ message: "You're not authorized" });
        }

        // User has valid role, continue to route handler
        next();
    } catch (err) {
        // Handle database errors or other unexpected issues
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