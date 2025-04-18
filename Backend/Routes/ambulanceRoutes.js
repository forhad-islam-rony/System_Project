import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createRequest,
    getRequestStatus,
    getUserRequests,
    getAllRequests,
    getAllDrivers,
    getDriverById,
    updateDriverStatus,
    updateDriverLocation,
    getNearbyDrivers,
    updateRequestStatus,
    assignDriver,
    completeRequest,
    createDriver,
    updateDriver,
    deleteDriver,
    cancelRequest
} from '../Controllers/ambulanceController.js';

const router = express.Router();

// Request routes
router.post('/request', protect, createRequest);
router.get('/request/:id', protect, getRequestStatus);
router.get('/requests/user', protect, getUserRequests);
router.get('/requests', protect, getAllRequests);
router.put('/request/:id/status', protect, updateRequestStatus);
router.put('/request/:id/assign', protect, assignDriver);
router.post('/request/:id/complete', protect, completeRequest);
router.delete('/request/:id', protect, cancelRequest);

// Driver routes
router.post('/drivers', protect, createDriver);
router.get('/drivers', protect, getAllDrivers);
router.get('/drivers/:id', protect, getDriverById);
router.put('/drivers/:id', protect, updateDriver);
router.delete('/drivers/:id', protect, deleteDriver);
router.put('/drivers/:id/status', protect, updateDriverStatus);
router.put('/drivers/:id/location', protect, updateDriverLocation);
router.get('/drivers/nearby', protect, getNearbyDrivers);

export default router; 