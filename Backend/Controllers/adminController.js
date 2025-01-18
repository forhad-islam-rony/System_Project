import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Booking from '../models/BookingSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const getDashboardStats = async (req, res) => {
    try {
        const totalDoctors = await Doctor.countDocuments();
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalAppointments = await Booking.countDocuments();
        
        const recentAppointments = await Booking.find()
            .populate('doctor')
            .populate('user')
            .limit(5)
            .sort({ createdAt: -1 });

        res.status(200).json({
            totalDoctors,
            totalPatients,
            totalAppointments,
            recentAppointments
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Booking.find()
            .populate('user', 'name photo age email phone')
            .populate('doctor', 'name photo specialization email phone')
            .sort({ appointmentDate: -1 })
            .lean();

        // Ensure unique appointments
        const uniqueAppointments = appointments.reduce((acc, current) => {
            const x = acc.find(item => item._id.toString() === current._id.toString());
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        res.status(200).json(uniqueAppointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addDoctor = async (req, res) => {
    try {
        const newDoctor = new Doctor(req.body);
        await newDoctor.save();
        res.status(201).json({ message: "Doctor added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteDoctor = async (req, res) => {
    try {
        await Doctor.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await User.findOne({ email, role: 'admin' });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '15d' }
        );

        const { password: _, ...adminData } = admin._doc;

        res.status(200).json({
            status: true,
            message: 'Successfully logged in as admin',
            token,
            data: adminData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const adminRegister = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Check if any admin exists
        const adminCount = await User.countDocuments({ role: 'admin' });
        
        // If there are existing admins, require authentication
        if (adminCount > 0 && !req.headers.authorization) {
            return res.status(403).json({ 
                message: 'Not authorized to create admin account' 
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newAdmin = new User({
            name,
            email,
            password: hashPassword,
            role: 'admin'
        });

        await newAdmin.save();

        res.status(201).json({ message: 'Admin created successfully' });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Validate status
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const appointment = await Booking.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Only allow certain status transitions
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: "Cannot modify cancelled appointments" });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({ 
            success: true,
            message: "Appointment status updated successfully",
            appointment 
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateDoctorApproval = async (req, res) => {
    const { id } = req.params;
    const { isApproved } = req.body;

    try {
        const doctor = await Doctor.findById(id);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Set the approval status
        doctor.isApproved = isApproved ? "approved" : "pending";
        
        // Automatically set availability to true when approved
        if (isApproved) {
            doctor.isAvailable = true;
        }

        await doctor.save();

        res.status(200).json({ 
            success: true,
            message: `Doctor ${isApproved ? 'approved' : 'unapproved'} successfully`,
            doctor 
        });
    } catch (error) {
        console.error('Error updating doctor approval:', error);
        res.status(500).json({ message: "Internal server error" });
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
            .populate('appointments')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}; 