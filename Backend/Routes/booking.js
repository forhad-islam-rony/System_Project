import express from 'express';
import { 
  getCheckoutSession, 
  updateAppointmentStatus,
  updateVisitType,
  getDoctorAppointments,
  checkVisitType,
  searchPatients,
  updatePatientVisitType,
  markAppointmentAsViewed
} from '../Controllers/bookingController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Patient routes
router.post('/checkout-session/:doctorId', authenticate, getCheckoutSession);

// Doctor routes
router.get('/doctor-appointments', authenticate, restrict(['doctor']), getDoctorAppointments);
router.put('/:appointmentId/status', authenticate, restrict(['doctor']), updateAppointmentStatus);
router.put('/:appointmentId/visit-type', authenticate, restrict(['doctor']), updateVisitType);
router.get('/check-visit-type/:doctorId', authenticate, checkVisitType);
router.get('/search-patients', authenticate, restrict(['doctor']), searchPatients);
router.post('/update-patient-visit-type', authenticate, restrict(['doctor']), updatePatientVisitType);
router.put('/:appointmentId/mark-viewed', authenticate, restrict(['doctor']), markAppointmentAsViewed);

export default router; 