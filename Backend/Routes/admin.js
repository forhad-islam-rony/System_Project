import express from 'express';
import { verifyAdmin } from '../middleware/authMiddleware.js';
import * as adminController from '../Controllers/adminController.js';

const router = express.Router();

// Public routes
router.post('/login', adminController.login);

// Protected routes
router.use(verifyAdmin);
router.post('/register', adminController.register);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/doctors', adminController.getAllDoctors);
router.post('/doctors', adminController.addDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);
router.get('/patients', adminController.getAllPatients);
router.get('/appointments', adminController.getAllAppointments);
router.patch('/appointments/:id/status', adminController.updateAppointmentStatus);
router.get('/moderators', adminController.getAllModerators);
router.post('/moderators', adminController.createModerator);
router.delete('/moderators/:id', adminController.deleteModerator);

export default router; 