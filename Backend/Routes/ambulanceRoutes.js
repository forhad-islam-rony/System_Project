/**
 * @fileoverview Ambulance Service Routes
 * @description Express router for ambulance service endpoints including
 * emergency requests, driver management, and real-time location tracking
 * @author Healthcare System Team
 * @version 1.0.0
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

// Import ambulance service controllers
import {
    // Request management controllers
    createRequest,      // Create new ambulance request
    getRequestStatus,   // Get request status
    getUserRequests,    // Get user's request history
    getAllRequests,     // Get all requests (admin)
    updateRequestStatus,// Update request status
    assignDriver,       // Assign driver to request
    completeRequest,    // Complete ambulance request
    cancelRequest,      // Cancel request
    
    // Driver management controllers
    createDriver,       // Register new driver
    getAllDrivers,      // Get all drivers
    getDriverById,      // Get specific driver
    updateDriver,       // Update driver details
    deleteDriver,       // Remove driver
    updateDriverStatus, // Update driver availability
    updateDriverLocation,// Update driver location
    getNearbyDrivers    // Find nearby available drivers
} from '../Controllers/ambulanceController.js';

// Create Express router instance
const router = express.Router();

// ==================== Request Routes ====================

/**
 * @route POST /api/v1/ambulance/request
 * @description Create new ambulance request
 * @access Private
 * @body {string} name - Patient's name
 * @body {string} phone - Contact number
 * @body {string} pickupLocation - Pickup location
 * @body {Object} coordinates - Location coordinates
 * @body {string} emergencyType - Type of emergency
 * @body {string} [preferredHospital] - Preferred hospital
 */
router.post('/request', protect, createRequest);

/**
 * @route GET /api/v1/ambulance/request/:id
 * @description Get status of specific ambulance request
 * @access Private
 * @param {string} id - Request ID
 */
router.get('/request/:id', protect, getRequestStatus);

/**
 * @route GET /api/v1/ambulance/requests/user
 * @description Get all requests made by authenticated user
 * @access Private
 */
router.get('/requests/user', protect, getUserRequests);

/**
 * @route GET /api/v1/ambulance/requests
 * @description Get all ambulance requests (admin only)
 * @access Private (Admin)
 */
router.get('/requests', protect, getAllRequests);

/**
 * @route PUT /api/v1/ambulance/request/:id/status
 * @description Update request status
 * @access Private
 * @param {string} id - Request ID
 * @body {string} status - New status
 */
router.put('/request/:id/status', protect, updateRequestStatus);

/**
 * @route PUT /api/v1/ambulance/request/:id/assign
 * @description Assign driver to request
 * @access Private (Admin)
 * @param {string} id - Request ID
 * @body {string} driverId - Driver to assign
 */
router.put('/request/:id/assign', protect, assignDriver);

/**
 * @route POST /api/v1/ambulance/request/:id/complete
 * @description Mark request as completed
 * @access Private
 * @param {string} id - Request ID
 * @body {string} driverId - Driver who completed
 */
router.post('/request/:id/complete', protect, completeRequest);

/**
 * @route DELETE /api/v1/ambulance/request/:id
 * @description Cancel ambulance request
 * @access Private
 * @param {string} id - Request ID to cancel
 */
router.delete('/request/:id', protect, cancelRequest);

// ==================== Driver Routes ====================

/**
 * @route POST /api/v1/ambulance/drivers
 * @description Register new ambulance driver
 * @access Private (Admin)
 * @body {string} driverName - Driver's full name
 * @body {string} phone - Contact number
 * @body {string} licenseNumber - Driver's license
 * @body {string} vehicleNumber - Ambulance number
 */
router.post('/drivers', protect, createDriver);

/**
 * @route GET /api/v1/ambulance/drivers
 * @description Get all registered drivers
 * @access Private
 */
router.get('/drivers', protect, getAllDrivers);

/**
 * @route GET /api/v1/ambulance/drivers/:id
 * @description Get specific driver details
 * @access Private
 * @param {string} id - Driver ID
 */
router.get('/drivers/:id', protect, getDriverById);

/**
 * @route PUT /api/v1/ambulance/drivers/:id
 * @description Update driver information
 * @access Private (Admin)
 * @param {string} id - Driver ID
 * @body {Object} updates - Fields to update
 */
router.put('/drivers/:id', protect, updateDriver);

/**
 * @route DELETE /api/v1/ambulance/drivers/:id
 * @description Remove driver from system
 * @access Private (Admin)
 * @param {string} id - Driver ID to remove
 */
router.delete('/drivers/:id', protect, deleteDriver);

/**
 * @route PUT /api/v1/ambulance/drivers/:id/status
 * @description Update driver availability status
 * @access Private
 * @param {string} id - Driver ID
 * @body {string} status - New status (available/busy/offline)
 */
router.put('/drivers/:id/status', protect, updateDriverStatus);

/**
 * @route PUT /api/v1/ambulance/drivers/:id/location
 * @description Update driver's current location
 * @access Private
 * @param {string} id - Driver ID
 * @body {number} latitude - Current latitude
 * @body {number} longitude - Current longitude
 */
router.put('/drivers/:id/location', protect, updateDriverLocation);

/**
 * @route GET /api/v1/ambulance/drivers/nearby
 * @description Find nearby available drivers
 * @access Private
 * @query {number} latitude - Search center latitude
 * @query {number} longitude - Search center longitude
 * @query {number} [radius=5000] - Search radius in meters
 */
router.get('/drivers/nearby', protect, getNearbyDrivers);

export default router; 