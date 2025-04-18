import axios from 'axios';
import { BASE_URL } from './config';

// Create a new ambulance request
export const createAmbulanceRequest = async (requestData) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/ambulance/request`, requestData, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get request status by ID
export const getRequestStatus = async (requestId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/ambulance/request/${requestId}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get user's ambulance requests
export const getUserRequests = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/ambulance/requests/user`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all drivers
export const getDrivers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/ambulance/drivers`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get driver by ID
export const getDriverById = async (driverId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/ambulance/drivers/${driverId}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update driver status
export const updateDriverStatus = async (driverId, status) => {
    try {
        const response = await axios.put(`${BASE_URL}/api/ambulance/drivers/${driverId}/status`, 
            { status },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update driver location
export const updateDriverLocation = async (driverId, location) => {
    try {
        const response = await axios.put(`${BASE_URL}/api/ambulance/drivers/${driverId}/location`, 
            location,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get nearby drivers
export const getNearbyDrivers = async (coordinates) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/ambulance/drivers/nearby`, {
            params: coordinates,
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update request status
export const updateRequestStatus = async (requestId, status) => {
    try {
        const response = await axios.put(`${BASE_URL}/api/ambulance/request/${requestId}/status`, 
            { status },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Assign driver to request
export const assignDriver = async (requestId, driverId) => {
    try {
        const response = await axios.put(`${BASE_URL}/api/ambulance/request/${requestId}/assign`, 
            { driverId },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 