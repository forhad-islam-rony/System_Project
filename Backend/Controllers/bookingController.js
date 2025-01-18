import Booking from '../models/BookingSchema.js';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';

export const createBooking = async (req, res) => {
  const { 
    doctor: doctorId,
    appointmentDate,
    appointmentTime,
    problem
  } = req.body;

  try {
    // Get doctor details
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Get user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check for existing unfinished booking
    const existingBooking = await Booking.findOne({
      doctor: doctorId,
      user: req.userId,
      status: { $ne: 'finished' }
    });

    if (existingBooking) {
      // Update existing booking
      existingBooking.appointmentDate = appointmentDate;
      existingBooking.appointmentTime = appointmentTime;
      existingBooking.problem = problem;
      
      const updatedBooking = await existingBooking.save();

      return res.status(200).json({
        success: true,
        message: 'Booking updated successfully',
        data: updatedBooking
      });
    }

    // Create new booking if no existing one
    const newBooking = new Booking({
      doctor: doctorId,
      user: req.userId,
      ticketPrice: doctor.ticketPrice,
      appointmentDate,
      appointmentTime,
      problem,
      visitType: 'first', // Always set as first visit initially
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: 'pending'
    });

    const savedBooking = await newBooking.save();

    // Add booking to doctor's appointments array
    await Doctor.findByIdAndUpdate(
      doctorId,
      { $push: { appointments: savedBooking._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Booking created successfully',
      data: savedBooking
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error with booking',
      error: error.message
    });
  }
};

export const getCheckoutSession = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const userId = req.userId;
    const bookingData = req.body;

    // Get doctor details
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Create booking with automatic visit type determination
    req.body.doctor = doctorId; // Ensure doctor ID is in the request body
    await createBooking(req, res);

  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checkout session',
      error: error.message
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  try {
    const booking = await Booking.findById(appointmentId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (status === 'finished') {
      // Delete the appointment if marked as finished
      await Booking.findByIdAndDelete(appointmentId);
      
      res.status(200).json({
        success: true,
        message: "Appointment finished and removed successfully"
      });
    } else {
      // Update status for other cases
      booking.status = status;
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Appointment status updated successfully",
        data: booking
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
      error: error.message
    });
  }
};

export const updateVisitType = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { visitType } = req.body;
    
    const booking = await Booking.findById(appointmentId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify that this booking belongs to the doctor
    if (booking.doctor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this booking"
      });
    }

    // Get the doctor's base price
    const doctor = await Doctor.findById(booking.doctor);
    let newPrice = doctor.ticketPrice;

    // Calculate new price based on visit type
    if (visitType === 'second') {
      newPrice = newPrice * 0.75; // 25% discount
    } else if (visitType === 'free') {
      newPrice = 0;
    }

    booking.visitType = visitType;
    booking.ticketPrice = newPrice;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Visit type updated successfully",
      data: booking
    });
  } catch (error) {
    console.error('Error updating visit type:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update visit type",
      error: error.message
    });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.userId;
    
    // Get appointments and populate user details from Users collection
    const appointments = await Booking.find({ doctor: doctorId })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .sort({ appointmentDate: -1 });

    // Get count of new appointments
    const newAppointmentsCount = await Booking.countDocuments({
      doctor: doctorId,
      isNewForDoctor: true,
      status: 'pending'
    });

    // Format the appointments to use user details from Users collection
    const formattedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      doctor: appointment.doctor,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      problem: appointment.problem,
      ticketPrice: appointment.ticketPrice,
      visitType: appointment.visitType,
      isNewForDoctor: appointment.isNewForDoctor,
      name: appointment.user?.name || 'N/A',
      email: appointment.user?.email || 'N/A',
      phone: appointment.user?.phone || 'N/A'
    }));

    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: formattedAppointments,
      newAppointments: newAppointmentsCount
    });
  } catch (error) {
    console.error('Error in getDoctorAppointments:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message
    });
  }
};

export const checkVisitType = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const userId = req.userId;

    // Find all finished appointments for this doctor-patient pair
    const finishedAppointments = await Booking.find({
      doctor: doctorId,
      user: userId,
      status: 'finished'
    }).sort({ createdAt: -1 });

    // Find any existing unfinished appointment
    const currentAppointment = await Booking.findOne({
      doctor: doctorId,
      user: userId,
      status: { $ne: 'finished' }
    });

    let visitType = 'first';
    
    if (currentAppointment) {
      // If there's an existing unfinished appointment, use its visit type
      visitType = currentAppointment.visitType;
    } else if (finishedAppointments.length > 0) {
      // If there are finished appointments, check the last one's type
      const lastAppointment = finishedAppointments[0];
      if (lastAppointment.visitType === 'free') {
        visitType = 'first'; // After a free visit, next is first
      } else if (lastAppointment.visitType === 'first') {
        visitType = 'second'; // After first visit, next is second
      } else if (lastAppointment.visitType === 'second') {
        visitType = 'first'; // After second visit, cycle back to first
      }
    }

    res.status(200).json({
      success: true,
      visitType,
      message: 'Visit type determined successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking visit type',
      error: error.message
    });
  }
};

export const searchPatients = async (req, res) => {
  try {
    const { email } = req.query;
    const doctorId = req.userId;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for search'
      });
    }

    // First find the user by email
    const user = await User.findOne({ 
      email: { $regex: email, $options: 'i' } 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No patient found with this email'
      });
    }

    // Then find all bookings for this user with this doctor
    const bookings = await Booking.find({
      doctor: doctorId,
      user: user._id
    }).sort({ createdAt: -1 });

    // Get the latest booking if exists
    const latestBooking = bookings[0];

    // Format the response data
    const patientData = {
      userId: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      lastVisitType: latestBooking ? latestBooking.visitType : null,
      lastVisitDate: latestBooking ? latestBooking.appointmentDate : null,
      totalVisits: bookings.length,
      currentPrice: latestBooking ? latestBooking.ticketPrice : null,
      bookingId: latestBooking ? latestBooking._id : null
    };

    res.status(200).json({
      success: true,
      data: patientData,
      message: 'Patient found'
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching patients',
      error: error.message
    });
  }
};

export const updatePatientVisitType = async (req, res) => {
  try {
    const { email, visitType } = req.body;
    const doctorId = req.userId;

    // First find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Get doctor's details
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Find existing booking for this user and doctor
    const existingBooking = await Booking.findOne({
      doctor: doctorId,
      user: user._id,
      status: { $ne: 'finished' } // Get any unfinished booking
    });

    let newPrice = doctor.ticketPrice;
    if (visitType === 'second') {
      newPrice = doctor.ticketPrice * 0.75;
    } else if (visitType === 'free') {
      newPrice = 0;
    }

    if (existingBooking) {
      // Update existing booking
      existingBooking.visitType = visitType;
      existingBooking.ticketPrice = newPrice;
      const updatedBooking = await existingBooking.save();

      return res.status(200).json({
        success: true,
        message: `Visit type updated to ${visitType}`,
        data: updatedBooking
      });
    }

    // If no existing booking, create new one
    const newBooking = new Booking({
      doctor: doctorId,
      user: user._id,
      ticketPrice: newPrice,
      visitType: visitType,
      email: user.email,
      name: user.name,
      phone: user.phone,
      status: 'pending',
      appointmentDate: new Date(),
      appointmentTime: '09:00',
      problem: 'Follow-up visit'
    });

    const savedBooking = await newBooking.save();

    // Update doctor's appointments array
    await Doctor.findByIdAndUpdate(
      doctorId,
      { $push: { appointments: savedBooking._id } }
    );

    res.status(200).json({
      success: true,
      message: `New booking created with ${visitType} type`,
      data: savedBooking
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient visit type',
      error: error.message
    });
  }
};

// Add new endpoint to mark appointment as viewed
export const markAppointmentAsViewed = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    await Booking.findByIdAndUpdate(appointmentId, {
      isNewForDoctor: false
    });

    res.status(200).json({
      success: true,
      message: "Appointment marked as viewed"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark appointment as viewed",
      error: error.message
    });
  }
}; 