/**
 * @fileoverview Authentication Controller for User Registration and Login
 * @description Handles user authentication including registration, login, and JWT token generation
 * for patients, doctors, and admins with secure password hashing and validation
 * @author Healthcare System Team
 * @version 1.0.0
 */

import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Generate JWT token for authenticated users
 * @function generateToken
 * @param {Object} user - User object from database
 * @returns {string} JWT token with user ID and role
 * @description Creates a JSON Web Token containing user ID and role information.
 * Token expires in 90 days and includes role for authorization purposes.
 */
const generateToken = user => {
  return jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET_KEY, {
    expiresIn: '90d'  // Long-lived token for better user experience
  });
};

/**
 * Register a new user (patient or doctor) in the system
 * @async
 * @function register
 * @param {Object} req - Express request object containing user registration data
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with success status and message
 * @description Handles user registration with validation, password hashing, and role-based account creation.
 * Supports both patient and doctor registration with appropriate schema validation.
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, photo, gender, role } = req.body;

        // Check if role is valid (only patient or doctor allowed)
        if (role !== 'patient' && role !== 'doctor') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role specified' 
            });
        }

        // Check if email exists in both User and Doctor collections
        const existingUser = await User.findOne({ email });
        const existingDoctor = await Doctor.findOne({ email });
        
        if (existingUser || existingDoctor) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        if (role === 'doctor') {
            // Create doctor with required fields
            const newDoctor = new Doctor({
                name,
                email,
                password: hashPassword,
                photo,
                gender,
                role: 'doctor',
                timeSlots: [] // Required field, will be updated later
            });

            await newDoctor.save();
        } else {
            // Create patient/user
            const newUser = new User({
                name,
                email,
                password: hashPassword,
                photo,
                gender,
                role
            });

            await newUser.save();
        }

        res.status(200).json({ 
            success: true, 
            message: 'User successfully created' 
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error, Try again' 
        });
    }
};

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

export const searchBloodDonors = async (req, res) => {
    try {
        const { bloodGroup, district, location } = req.query;
        
        if (!bloodGroup) {
            return res.status(400).json({
                success: false,
                message: "Blood group is required"
            });
        }

        // Build query
        let query = {
            bloodType: bloodGroup,
            isDonating: true,
            role: 'patient'
        };

        // Add district filter if provided
        if (district && district.trim()) {
            query.district = district.trim();
        }

        // Add location filter if provided (case-insensitive partial match)
        if (location && location.trim()) {
            query.location = new RegExp(location.trim(), 'i');
        }

        // Find matching donors
        const donors = await User.find(query)
            .select('name photo bloodType phone gender district location')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Donors fetched successfully",
            data: donors
        });

    } catch (error) {
        console.error('Error searching donors:', error);
        res.status(500).json({
            success: false,
            message: "Error searching donors. Please try again."
        });
    }
};