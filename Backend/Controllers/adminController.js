import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Booking from '../models/BookingSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const getDashboardStats = async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await Doctor.countDocuments();
        const totalAppointments = await Booking.countDocuments();
        
        // Calculate total earnings from completed appointments
        const earnings = await Booking.aggregate([
            { $match: { status: 'finished', isPaid: true } },
            { $group: { _id: null, total: { $sum: '$fee' } } }
        ]);
        const totalEarnings = earnings.length > 0 ? earnings[0].total : 0;

        // Get recent appointments
        const recentAppointments = await Booking.find()
            .sort({ appointmentDate: -1 })
            .limit(5)
            .populate('user', 'name photo')
            .populate('doctor', 'name specialization')
            .lean();

        res.status(200).json({
            success: true,
            message: "Dashboard stats fetched successfully",
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
            message: "Internal server error" 
        });
    }
};

export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Booking.find()
            .populate('user', 'name photo email')
            .populate('doctor', 'name photo specialization')
            .sort({ appointmentDate: -1 });

        res.status(200).json({
            success: true,
            message: "Appointments fetched successfully",
            data: appointments
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
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
        // Find all users with role 'patient' and exclude password
        const patients = await User.find({ role: 'patient' })
            .select('-password')
            .lean();

        // Get bookings for each patient
        const patientsWithStats = await Promise.all(patients.map(async (patient) => {
            const bookings = await Booking.find({ user: patient._id })
                .populate('doctor', 'name specialization')
                .lean();

            const activeBookings = bookings.filter(
                booking => booking.status !== 'cancelled'
            ).length;

            return {
                ...patient,
                totalAppointments: bookings.length,
                activeAppointments: activeBookings,
                appointments: bookings // Include bookings for latest appointment info
            };
        }));

        res.status(200).json({
            success: true,
            message: "Patients fetched successfully",
            data: patientsWithStats
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
}; 