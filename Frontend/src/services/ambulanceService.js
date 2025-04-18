import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create a new ambulance request
export const createRequest = async (requestData) => {
  try {
    const response = await axiosInstance.post('/ambulance/request', requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all ambulance requests (admin only)
export const getAllRequests = async () => {
  try {
    const response = await axiosInstance.get('/ambulance/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all drivers
export const getAllDrivers = async () => {
  try {
    const response = await axiosInstance.get('/ambulance/drivers');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get request status by ID
export const getRequestStatus = async (requestId) => {
  try {
    const response = await axiosInstance.get(`/ambulance/request/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's requests
export const getUserRequests = async () => {
  try {
    const response = await axiosInstance.get('/ambulance/requests/user');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Assign driver to request
export const assignDriver = async (requestId, driverId) => {
  try {
    const response = await axiosInstance.put(`/ambulance/request/${requestId}/assign`, { driverId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Complete request
export const completeRequest = async (requestId, driverId) => {
  try {
    const response = await axiosInstance.post(
      `/ambulance/request/${requestId}/complete`,
      { requestId, driverId }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update driver status
export const updateDriverStatus = async (driverId, status) => {
  try {
    const response = await axiosInstance.put(`/ambulance/drivers/${driverId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update driver location
export const updateDriverLocation = async (driverId, latitude, longitude) => {
  try {
    const response = await axiosInstance.put(`/ambulance/drivers/${driverId}/location`, { latitude, longitude });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get nearby drivers
export const getNearbyDrivers = async (coordinates) => {
  try {
    const response = await axios.get(`${API_URL}/ambulance/nearby-drivers`, {
      params: coordinates
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update request status
export const updateRequestStatus = async (requestId, status) => {
  try {
    const response = await axios.patch(`${API_URL}/ambulance/request/${requestId}/status`, 
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new driver
export const createDriver = async (driverData) => {
  try {
    const response = await axiosInstance.post('/ambulance/drivers', driverData);
    return response.data;
  } catch (error) {
    console.error('Error creating driver:', error.response?.data || error);
    if (error.response?.data?.message?.includes('duplicate key error')) {
      if (error.response.data.message.includes('phone_1')) {
        throw new Error('A driver with this phone number already exists');
      } else if (error.response.data.message.includes('licenseNumber_1')) {
        throw new Error('A driver with this license number already exists');
      }
    }
    throw error.response?.data || error;
  }
};

// Update driver
export const updateDriver = async (driverId, driverData) => {
  try {
    const response = await axiosInstance.put(`/ambulance/drivers/${driverId}`, driverData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete driver
export const deleteDriver = async (driverId) => {
  try {
    const response = await axiosInstance.delete(`/ambulance/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel an ambulance request
export const cancelRequest = async (requestId) => {
  try {
    console.log(`Attempting to cancel request with ID: ${requestId}`);
    
    // Get user info from local storage
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    const isAdmin = userInfo.role === 'admin';
    
    if (isAdmin) {
      console.log('Admin user detected - using admin cancellation');
    }
    
    const response = await axiosInstance.delete(`/ambulance/request/${requestId}`);
    console.log('Cancel request response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling request:', error);
    throw error.response?.data || error;
  }
}; 