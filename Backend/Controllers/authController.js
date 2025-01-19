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
    try {
        const { name, email, password, photo, gender, role } = req.body;

        // Check if role is valid (only patient or doctor allowed)
        if (role !== 'patient' && role !== 'doctor') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role specified' 
            });
        }

        // Check if email exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashPassword,
            photo,
            gender,
            role
        });

        await newUser.save();

        res.status(200).json({ 
            success: true, 
            message: 'User successfully created' 
        });

    } catch (err) {
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