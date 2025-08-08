/**
 * @fileoverview Ambulance Service Controller
 * @description Manages ambulance drivers and emergency requests with real-time
 * location tracking, request assignment, and status management
 * @author Healthcare System Team
 * @version 1.0.0
 */

import AmbulanceDriver from '../models/AmbulanceDriver.js';
import AmbulanceRequest from '../models/AmbulanceRequest.js';

// ==================== Driver Controllers ====================

/**
 * Create new ambulance driver
 * @async
 * @function createDriver
 * @param {Object} req - Express request object
 * @param {Object} req.body - Driver details
 * @param {string} req.body.driverName - Driver's full name
 * @param {string} req.body.phone - Driver's contact number
 * @param {string} req.body.licenseNumber - Driver's license number
 * @param {Object} req.body.location - Driver's current location
 * @param {string} req.body.vehicleNumber - Ambulance vehicle number
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Created driver details
 */
export const createDriver = async (req, res) => {
    try {
        const driver = new AmbulanceDriver(req.body);
        await driver.save();
        res.status(201).json({
            success: true,
            message: 'Driver created successfully',
            data: driver
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all registered ambulance drivers
 * @async
 * @function getAllDrivers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} List of all ambulance drivers
 * @description Retrieves all registered ambulance drivers with their details
 * including current status and location
 */
export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await AmbulanceDriver.find();
        res.status(200).json({
            success: true,
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get specific driver by ID
 * @async
 * @function getDriverById
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Driver's ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Driver details if found
 * @description Retrieves a specific ambulance driver's details by their ID
 */
export const getDriverById = async (req, res) => {
    try {
        const driver = await AmbulanceDriver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update driver information
 * @async
 * @function updateDriver
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Driver's ID
 * @param {Object} req.body - Updated driver details
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated driver details
 * @description Updates an ambulance driver's information with validation
 */
export const updateDriver = async (req, res) => {
    try {
        const driver = await AmbulanceDriver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Driver updated successfully',
            data: driver
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete ambulance driver
 * @async
 * @function deleteDriver
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Driver's ID to delete
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Success message if deleted
 * @description Removes an ambulance driver from the system
 */
export const deleteDriver = async (req, res) => {
    try {
        const driver = await AmbulanceDriver.findByIdAndDelete(req.params.id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Driver deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== Request Controllers ====================

/**
 * Create new ambulance request
 * @async
 * @function createRequest
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request details
 * @param {string} req.body.name - Patient's name
 * @param {string} req.body.phone - Contact phone number
 * @param {string} req.body.pickupLocation - Pickup location description
 * @param {string} req.body.emergencyType - Type of medical emergency
 * @param {string} req.body.preferredHospital - Preferred hospital (optional)
 * @param {Object} req.body.coordinates - Location coordinates
 * @param {string} req.userId - Authenticated user's ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Created request details and nearby drivers
 * @description Creates a new ambulance request and finds nearby available drivers
 */
export const createRequest = async (req, res) => {
    try {
        const { name, phone, pickupLocation, emergencyType, preferredHospital, coordinates } = req.body;
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required to request an ambulance'
            });
        }
        
        // Create new ambulance request
        const request = new AmbulanceRequest({
            name,
            phone,
            pickupLocation,
            coordinates,
            emergencyType,
            preferredHospital,
            userId
        });

        await request.save();
        console.log(`Ambulance request created for user: ${userId}, request ID: ${request._id}`);

        // Find nearby available drivers
        const nearbyDrivers = await AmbulanceDriver.find({
            status: 'available'
        }).catch(err => {
            console.log('Error finding nearby drivers:', err);
            return [];
        });

        res.status(201).json({
            success: true,
            message: 'Ambulance request created successfully',
            data: request,
            nearbyDrivers
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all ambulance requests
 * @async
 * @function getAllRequests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} List of all ambulance requests with driver details
 * @description Retrieves all ambulance requests sorted by creation date,
 * populated with assigned driver information
 */
export const getAllRequests = async (req, res) => {
    try {
        const requests = await AmbulanceRequest.find()
            .populate('driverId', 'driverName phone location status')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Assign driver to ambulance request
 * @async
 * @function assignDriver
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Request ID
 * @param {Object} req.body - Assignment details
 * @param {string} req.body.driverId - Driver ID to assign
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated request with assigned driver details
 * @description Assigns an available driver to an ambulance request and
 * updates both request and driver status
 */
export const assignDriver = async (req, res) => {
    try {
        const { driverId } = req.body;
        
        const request = await AmbulanceRequest.findByIdAndUpdate(
            req.params.id,
            {
                driverId,
                status: 'assigned'
            },
            { new: true }
        ).populate('driverId', 'driverName phone location status');

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        // Update driver status to busy
        await AmbulanceDriver.findByIdAndUpdate(driverId, { status: 'busy' });

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Complete ambulance request
 * @async
 * @function completeRequest
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Request ID
 * @param {Object} req.body - Request details
 * @param {string} req.body.driverId - Driver ID to mark as available
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated request with completed status
 * @description Marks an ambulance request as completed and makes the
 * assigned driver available for new requests
 */
export const completeRequest = async (req, res) => {
    try {
        const { driverId } = req.body;
        const requestId = req.params.id;

        // Update request status to completed
        const request = await AmbulanceRequest.findByIdAndUpdate(
            requestId,
            { status: 'completed' },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Make driver available again
        if (driverId) {
            await AmbulanceDriver.findByIdAndUpdate(
                driverId,
                { status: 'available' }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Request completed successfully',
            data: request
        });
    } catch (error) {
        console.error('Complete request error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get ambulance request status
 * @async
 * @function getRequestStatus
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Request ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Request details with driver information
 * @description Retrieves current status of an ambulance request including
 * assigned driver details if available
 */
export const getRequestStatus = async (req, res) => {
    try {
        const request = await AmbulanceRequest.findById(req.params.id)
            .populate('driverId', 'driverName phone location status');

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get user's ambulance request history
 * @async
 * @function getUserRequests
 * @param {Object} req - Express request object
 * @param {string} req.userId - Authenticated user's ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} List of user's ambulance requests
 * @description Retrieves all ambulance requests made by a specific user,
 * sorted by creation date with driver details
 */
export const getUserRequests = async (req, res) => {
    try {
        const userId = req.userId;
        console.log('Getting ambulance requests for user:', userId);
        
        if (!userId) {
            console.log('User ID missing in request');
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
        const requests = await AmbulanceRequest.find({ userId })
            .populate('driverId', 'driverName phone location')
            .sort('-createdAt');
            
        console.log(`Found ${requests.length} requests for user:`, userId);
        
        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error getting user requests:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all ambulance drivers
 * @async
 * @function getDrivers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} List of all drivers without version field
 * @description Retrieves all ambulance drivers with their details,
 * excluding the version field for cleaner response
 */
export const getDrivers = async (req, res) => {
    try {
        const drivers = await AmbulanceDriver.find().select('-__v');
        
        res.status(200).json({
            success: true,
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Update ambulance driver's status
 * @async
 * @function updateDriverStatus
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Driver ID
 * @param {Object} req.body - Update details
 * @param {string} req.body.status - New driver status
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated driver details
 * @description Updates an ambulance driver's availability status
 * (available/busy/offline)
 */
export const updateDriverStatus = async (req, res) => {
    try {
        const driver = await AmbulanceDriver.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({
                success: false,
                error: 'Driver not found'
            });
        }

        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Update ambulance driver's location
 * @async
 * @function updateDriverLocation
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Driver ID
 * @param {Object} req.body - Location details
 * @param {number} req.body.latitude - Location latitude
 * @param {number} req.body.longitude - Location longitude
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated driver details with new location
 * @description Updates an ambulance driver's current location using
 * GeoJSON Point format for location tracking
 */
export const updateDriverLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        
        const driver = await AmbulanceDriver.findByIdAndUpdate(
            req.params.id,
            {
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({
                success: false,
                error: 'Driver not found'
            });
        }

        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Find nearby available ambulance drivers
 * @async
 * @function getNearbyDrivers
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.latitude - Location latitude
 * @param {number} req.query.longitude - Location longitude
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} List of nearby available drivers
 * @description Finds available ambulance drivers within 5km radius
 * of the specified location using MongoDB's geospatial queries
 */
export const getNearbyDrivers = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        const drivers = await AmbulanceDriver.find({
            status: 'available',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: 5000 // 5km radius
                }
            }
        });

        res.status(200).json({
            success: true,
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Update ambulance request status
 * @async
 * @function updateRequestStatus
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Request ID
 * @param {Object} req.body - Update details
 * @param {string} req.body.status - New request status
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated request with driver details
 * @description Updates the status of an ambulance request and returns
 * the updated request with populated driver information
 */
export const updateRequestStatus = async (req, res) => {
    try {
        const request = await AmbulanceRequest.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        ).populate('driverId', 'driverName phone location status');

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Cancel ambulance request
 * @async
 * @function cancelRequest
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Request ID to cancel
 * @param {string} req.userId - Authenticated user's ID
 * @param {string} req.role - User's role (admin/user)
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Success message if cancelled
 * @description Cancels an ambulance request with proper authorization checks.
 * Only request owner or admin can cancel. Also handles driver availability.
 */
export const cancelRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.userId;
        const userRole = req.role; 
        
        console.log(`Cancel request - ID: ${requestId}, User: ${userId}, Role: ${userRole}`);
        
        // Find the request
        const request = await AmbulanceRequest.findById(requestId);
        
        if (!request) {
            console.log(`Request ${requestId} not found`);
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }
        
        // For debugging - log the user role and request owner
        console.log(`Cancel request - Request owner: ${request.userId}, Current user: ${userId}, Role: ${userRole}`);
        
        // Admin can cancel any request, regular users can only cancel their own
        const isRequestOwner = request.userId.toString() === userId;
        const isAdmin = userRole === 'admin';
        
        if (!isRequestOwner && !isAdmin) {
            console.log(`Permission denied - User ${userId} with role ${userRole} tried to cancel request owned by ${request.userId}`);
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to cancel this request'
            });
        }
        
        // Only allow cancellation if the request is not completed
        if (request.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a request that has already been completed'
            });
        }
        
        // If a driver was assigned, update their status back to available
        if (request.driverId) {
            console.log(`Updating driver ${request.driverId} status to available`);
            await AmbulanceDriver.findByIdAndUpdate(
                request.driverId,
                { status: 'available' }
            );
        }
        
        // Delete the request completely from database
        await AmbulanceRequest.findByIdAndDelete(requestId);
        console.log(`Request ${requestId} successfully deleted by ${isAdmin ? 'admin' : 'owner'}`);
        
        return res.status(200).json({
            success: true,
            message: 'Ambulance request cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling request:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 