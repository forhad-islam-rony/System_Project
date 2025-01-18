import express from 'express';
import { verifyAdmin } from '../middleware/authMiddleware.js';
import * as adminController from '../Controllers/adminController.js';

const router = express.Router();

// Public admin routes
router.post('/login', adminController.adminLogin);
router.post('/register', adminController.adminRegister);

// Protected admin routes
router.get('/dashboard-stats', verifyAdmin, adminController.getDashboardStats);
router.get('/appointments', verifyAdmin, adminController.getAllAppointments);
router.get('/doctors', verifyAdmin, adminController.getAllDoctors);
router.post('/doctors', verifyAdmin, adminController.addDoctor);
router.delete('/doctors/:id', verifyAdmin, adminController.deleteDoctor);
router.patch('/appointments/:id', verifyAdmin, adminController.updateAppointmentStatus);
router.patch('/doctors/:id/approve', verifyAdmin, adminController.updateDoctorApproval);
router.patch('/doctors/:id/availability', verifyAdmin, adminController.updateDoctorAvailability);
router.get('/patients', verifyAdmin, adminController.getAllPatients);

export default router; 