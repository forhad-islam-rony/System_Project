import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaAmbulance, FaUser, FaPhone, FaMapMarkerAlt, FaUserPlus, FaSpinner, FaClock } from 'react-icons/fa';
import { MdEmergency, MdRefresh } from 'react-icons/md';
import toast from 'react-hot-toast';
import { 
  getAllDrivers, 
  getAllRequests, 
  assignDriver, 
  completeRequest,
  updateDriverStatus,
  cancelRequest
} from '../../services/ambulanceService';

const AdminAmbulanceDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    assignedRequests: 0,
    completedRequests: 0,
    availableDrivers: 0,
    busyDrivers: 0
  });

  const fetchData = async (showToast = false) => {
    try {
      setRefreshing(true);
      const [driversResponse, requestsResponse] = await Promise.all([
        getAllDrivers(),
        getAllRequests()
      ]);
      
      const driversData = driversResponse.data || [];
      const requestsData = requestsResponse.data || [];
      
      // Filter out completed requests for display
      const activeRequests = requestsData.filter(request => request.status !== 'completed');
      
      setDrivers(driversData);
      setRequests(activeRequests);
      
      // Update stats
      setStats({
        totalRequests: requestsData.length,
        pendingRequests: requestsData.filter(r => r.status === 'pending').length,
        assignedRequests: requestsData.filter(r => r.status === 'assigned').length,
        completedRequests: requestsData.filter(r => r.status === 'completed').length,
        availableDrivers: driversData.filter(d => d.status === 'available').length,
        busyDrivers: driversData.filter(d => d.status === 'busy').length
      });

      setError(null);
      if (showToast) toast.success('Data refreshed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignDriver = async (requestId, driverId) => {
    try {
      await assignDriver(requestId, driverId);
      await fetchData();
      toast.success('Driver assigned successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign driver');
    }
  };

  const handleCompleteRequest = async (requestId, driverId) => {
    try {
      await completeRequest(requestId, driverId);
      // Update the request status locally for immediate feedback
      setRequests(prevRequests => 
        prevRequests.filter(request => request._id !== requestId)
      );
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        completedRequests: prevStats.completedRequests + 1,
        assignedRequests: prevStats.assignedRequests - 1
      }));
      toast.success('Request marked as completed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete request');
    }
  };

  const handleDriverStatusChange = async (driverId, newStatus) => {
    try {
      await updateDriverStatus(driverId, newStatus);
      await fetchData();
      toast.success('Driver status updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update driver status');
    }
  };

  const handleDeleteRequest = async (requestId, driverId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }
    
    try {
      console.log(`Admin deleting request: ${requestId}`);
      setLoading(true);
      const response = await cancelRequest(requestId);
      
      if (response.success) {
        console.log('Request deleted successfully');
        // Update local state for immediate feedback
        setRequests(prevRequests => 
          prevRequests.filter(request => request._id !== requestId)
        );
        
        // If a driver was assigned, update stats
        if (driverId) {
          setStats(prevStats => ({
            ...prevStats,
            availableDrivers: prevStats.availableDrivers + 1,
            busyDrivers: prevStats.busyDrivers - 1
          }));
        }
        
        toast.success('Request deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete request');
      }
    } catch (err) {
      console.error('Error deleting request:', err);
      toast.error(err.response?.data?.message || 'Failed to delete request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primaryColor mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ambulance Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">Manage ambulance requests and drivers</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition-colors"
              >
                {refreshing ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <MdRefresh />
                )}
                Refresh
              </button>
              <Link
                to="/admin/ambulance/drivers"
                className="flex items-center gap-2 bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-primaryColor/90 transition-colors"
              >
                <FaUserPlus />
                Manage Drivers
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaAmbulance className="h-6 w-6 text-primaryColor" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Active Requests</h3>
                  <p className="text-2xl font-semibold text-primaryColor">{requests.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaClock className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Pending</h3>
                  <p className="text-2xl font-semibold text-yellow-500">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUser className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Available Drivers</h3>
                  <p className="text-2xl font-semibold text-blue-500">{stats.availableDrivers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MdEmergency className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Completed</h3>
                  <p className="text-2xl font-semibold text-green-500">{stats.completedRequests}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Requests */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Active Requests</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {requests.length > 0 ? (
                requests
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(request => (
                    <div key={request._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{request.name}</h3>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FaPhone className="h-4 w-4" />
                              {request.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <FaClock className="h-4 w-4" />
                              {new Date(request.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="h-5 w-5 text-primaryColor mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Pickup Location</p>
                            <p className="text-sm text-gray-500">{request.pickupLocation}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MdEmergency className="h-5 w-5 text-primaryColor mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Emergency Type</p>
                            <p className="text-sm text-gray-500">{request.emergencyType}</p>
                          </div>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="mt-4 flex justify-between items-center">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assign Driver
                            </label>
                            <select
                              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primaryColor focus:border-primaryColor"
                              onChange={(e) => handleAssignDriver(request._id, e.target.value)}
                              defaultValue=""
                            >
                              <option value="">Select Driver</option>
                              {drivers
                                .filter(driver => driver.status === 'available')
                                .map(driver => (
                                  <option key={driver._id} value={driver._id}>
                                    {driver.driverName} ({driver.location})
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => handleDeleteRequest(request._id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                              disabled={loading}
                            >
                              {loading ? <FaSpinner className="animate-spin" /> : 'Delete'}
                            </button>
                          </div>
                        </div>
                      )}

                      {request.status === 'assigned' && request.driverId && (
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FaAmbulance className="text-primaryColor" />
                            <span className="text-sm font-medium">
                              Driver: {request.driverId.driverName}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCompleteRequest(request._id, request.driverId._id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                              disabled={loading}
                            >
                              {loading ? <FaSpinner className="animate-spin" /> : 'Complete'}
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(request._id, request.driverId._id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                              disabled={loading}
                            >
                              {loading ? <FaSpinner className="animate-spin" /> : 'Delete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No active requests found
                </div>
              )}
            </div>
          </div>

          {/* Drivers */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Drivers</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {drivers.length > 0 ? (
                drivers.map(driver => (
                  <div key={driver._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{driver.driverName}</h3>
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FaPhone className="h-4 w-4" />
                            {driver.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="h-4 w-4" />
                            {driver.location}
                          </div>
                        </div>
                      </div>
                      <select
                        value={driver.status}
                        onChange={(e) => handleDriverStatusChange(driver._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          driver.status === 'available' ? 'bg-green-100 text-green-800' : 
                          driver.status === 'busy' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No drivers found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAmbulanceDashboard; 