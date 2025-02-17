import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Booking from '../models/BookingSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Moderator from '../models/ModeratorSchema.js';
import Admin from '../models/AdminSchema.js';

export const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await Doctor.countDocuments();
        const totalAppointments = await Booking.countDocuments();

        // Calculate total earnings
        const bookings = await Booking.find({ status: 'approved' });
        const totalEarnings = bookings.reduce((total, booking) => total + booking.fee, 0);

        // Get recent appointments
        const recentAppointments = await Booking.find()
            .populate('user', 'name photo')
            .populate('doctor', 'name specialization')
            .sort('-createdAt')
            .limit(10);

        res.status(200).json({
            success: true,
            message: 'Stats fetched successfully',
            data: {
                totalPatients,
                totalDoctors,
                totalAppointments,
                totalEarnings,
                recentAppointments
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats',
            error: error.message
        });
    }
};

export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Booking.find()
            .populate('user', 'name photo')
            .populate('doctor', 'name specialization')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            message: 'Appointments fetched successfully',
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
};

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .select('-password')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            message: 'Doctors fetched successfully',
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctors',
            error: error.message
        });
    }
};

export const addDoctor = async (req, res) => {
    try {
        const newDoctor = new Doctor(req.body);
        await newDoctor.save();

        res.status(201).json({
            success: true,
            message: 'Doctor added successfully',
            data: newDoctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add doctor',
            error: error.message
        });
    }
};

export const deleteDoctor = async (req, res) => {
    try {
        await Doctor.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete doctor',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Admin login attempt for:', email);

    // Find admin user
    const admin = await User.findOne({ 
      email: email,
      role: 'admin'  // Make sure user has admin role
    });

    if (!admin) {
      console.log('Admin not found');
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordMatch) {
      console.log('Invalid password');
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: admin._id,
        email: admin.email,
        role: 'admin'
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    console.log('Admin login successful');

    res.status(200).json({
      success: true,
      message: 'Successfully logged in as admin',
      token,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        photo: admin.photo
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email,
      role: 'admin'
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin user
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully'
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment status',
            error: error.message
        });
    }
};

export const updateDoctorApproval = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { isApproved: status },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Doctor ${status} successfully`,
      data: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor status',
      error: error.message
    });
  }
};

export const updateDoctorAvailability = async (req, res) => {
    const { id } = req.params;
    const { isAvailable } = req.body;

    try {
        const doctor = await Doctor.findByIdAndUpdate(
            id,
            { isAvailable },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ 
            success: true,
            message: "Doctor availability updated successfully",
            doctor 
        });
    } catch (error) {
        console.error('Error updating doctor availability:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' })
            .select('-password')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            message: 'Patients fetched successfully',
            data: patients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch patients',
            error: error.message
        });
    }
};

// Create new moderator
export const createModerator = async (req, res) => {
  try {
    const { email, password, name, division } = req.body;

    const existingModerator = await Moderator.findOne({ email });
    if (existingModerator) {
      return res.status(400).json({
        success: false,
        message: 'Moderator already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new moderator
    const newModerator = new Moderator({
      email,
      password: hashedPassword,
      name,
      division
    });

    await newModerator.save();

    res.status(201).json({
      success: true,
      message: 'Moderator created successfully',
      data: { ...newModerator._doc, password: undefined }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create moderator',
      error: error.message
    });
  }
};

// Get all moderators
export const getAllModerators = async (req, res) => {
  try {
    const moderators = await Moderator.find()
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Moderators fetched successfully',
      data: moderators
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch moderators',
      error: error.message
    });
  }
};

// Delete moderator
export const deleteModerator = async (req, res) => {
  try {
    const moderator = await Moderator.findByIdAndDelete(req.params.id);

    if (!moderator) {
      return res.status(404).json({
        success: false,
        message: 'Moderator not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Moderator deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete moderator',
      error: error.message
    });
  }
};

// Update moderator status (active/inactive)
export const updateModeratorStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const moderator = await Moderator.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!moderator) {
      return res.status(404).json({
        success: false,
        message: 'Moderator not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Moderator status updated successfully',
      data: moderator
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update moderator status',
      error: error.message
    });
  }
}; 