import Booking from '../models/BookingSchema.js';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';
import PatientDoctor from '../models/PatientDoctorSchema.js';

// Add this validation in your booking controller
const validateBookingDate = (appointmentDate) => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  return new Date(appointmentDate) >= minDate;
};

export const createBooking = async (req, res) => {
  const { 
    doctor: doctorId,
    appointmentDate,
    appointmentTime,
    problem
  } = req.body;

  try {
    if (!validateBookingDate(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Appointments must be booked at least 2 days in advance'
      });
    }

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
    
    // Get doctor details
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Get the visit type from PatientDoctor
    const patientDoctor = await PatientDoctor.findOne({
      doctor: doctorId,
      patient: userId
    });

    const visitType = patientDoctor ? patientDoctor.nextVisitType : 'first';
    
    // Calculate fee based on visit type
    let fee = doctor.ticketPrice;
    if (visitType === 'second') {
      fee *= 0.75; // 25% discount
    } else if (visitType === 'free') {
      fee = 0;
    }

    // Create booking with the determined visit type and fee
    const booking = new Booking({
      ...req.body,
      doctor: doctorId,
      user: userId,
      visitType,
      fee
    });

    const savedBooking = await booking.save();

    // After successful booking, increment visits and reset next visit type
    await PatientDoctor.findOneAndUpdate(
      {
        doctor: doctorId,
        patient: userId
      },
      {
        $inc: { totalVisits: 1 },
        nextVisitType: 'first' // Reset to first visit after booking
      },
      {
        upsert: true,
        new: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Booking created successfully',
      data: savedBooking
    });

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
      // Update the history status to finished
      await PatientDoctor.findOneAndUpdate(
        {
          doctor: booking.doctor,
          patient: booking.user,
          'history.bookingId': booking._id
        },
        {
          'history.$.status': 'finished'
        }
      );

      // Delete the appointment if marked as finished
      await Booking.findByIdAndDelete(appointmentId);
      
      res.status(200).json({
        success: true,
        message: "Appointment finished and removed successfully"
      });
    } else if (status === 'approved') {
      // Update booking status
      booking.status = status;
      await booking.save();

      // Add to patient-doctor history with fee
      await PatientDoctor.findOneAndUpdate(
        {
          doctor: booking.doctor,
          patient: booking.user
        },
        {
          $push: {
            history: {
              bookingId: booking._id,
              visitType: booking.visitType,
              appointmentDate: booking.appointmentDate,
              appointmentTime: booking.appointmentTime,
              problem: booking.problem,
              fee: booking.fee,
              status: 'approved'
            }
          }
        },
        { upsert: true }
      );

      res.status(200).json({
        success: true,
        message: "Appointment status updated successfully",
        data: booking
      });
    } else {
      // Handle other status updates (like 'cancelled')
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

    const patientDoctor = await PatientDoctor.findOne({
      doctor: doctorId,
      patient: userId
    });

    const visitType = patientDoctor ? patientDoctor.nextVisitType : 'first';

    // Get doctor's base price
    const doctor = await Doctor.findById(doctorId);
    let price = doctor.ticketPrice;

    // Calculate price based on visit type
    if (visitType === 'second') {
      price *= 0.75; // 25% discount
    } else if (visitType === 'free') {
      price = 0;
    }

    res.status(200).json({
      success: true,
      visitType,
      price
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error checking visit type',
      error: err.message
    });
  }
};

export const searchPatients = async (req, res) => {
  try {
    const { email } = req.query;
    const doctorId = req.userId;

    const patient = await User.findOne({ email });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const patientDoctor = await PatientDoctor.findOne({
      doctor: doctorId,
      patient: patient._id
    });

    const responseData = {
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      totalVisits: patientDoctor ? patientDoctor.totalVisits : 0,
      nextVisitType: patientDoctor ? patientDoctor.nextVisitType : 'first'
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error searching patients',
      error: err.message
    });
  }
};

export const updatePatientVisitType = async (req, res) => {
  try {
    const { email, visitType } = req.body;
    const doctorId = req.userId;

    const patient = await User.findOne({ email });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const patientDoctor = await PatientDoctor.findOneAndUpdate(
      {
        doctor: doctorId,
        patient: patient._id
      },
      {
        nextVisitType: visitType,
        $setOnInsert: { totalVisits: 0 }
      },
      {
        upsert: true,
        new: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Visit type updated successfully',
      data: patientDoctor
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating visit type',
      error: err.message
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