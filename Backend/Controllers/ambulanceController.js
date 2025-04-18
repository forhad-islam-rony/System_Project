import AmbulanceDriver from '../models/AmbulanceDriver.js';
import AmbulanceRequest from '../models/AmbulanceRequest.js';

// Driver Controllers
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

// Request Controllers
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

// Get request status
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

// Get user's requests
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

// Get all drivers
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

// Update driver status
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

// Update driver location
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

// Get nearby drivers
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

// Update request status
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

// Cancel a request
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