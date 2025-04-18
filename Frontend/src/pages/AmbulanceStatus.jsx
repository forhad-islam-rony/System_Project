import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getUserRequests, cancelRequest } from '../services/ambulanceService';
import { Link, useNavigate } from 'react-router-dom';
import { FaAmbulance, FaPhone, FaMapMarkerAlt, FaHospital, FaSpinner, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { MdEmergency } from 'react-icons/md';
import toast from 'react-hot-toast';

const AmbulanceStatus = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Update the fetchRequests to be a callback
    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Fetching ambulance requests...');
            const response = await getUserRequests();
            console.log('Ambulance requests data:', response);
            setRequests(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to fetch your ambulance requests');
            toast.error('Could not load your ambulance request history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
        // Refresh data every 30 seconds
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, [fetchRequests]);

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'pending':
                return 'Your request is pending. We are looking for an available driver. You can cancel this request if needed.';
            case 'assigned':
                return 'A driver has been assigned to your request and is on the way. You can still cancel if necessary.';
            case 'completed':
                return 'This request has been completed.';
            default:
                return 'Request status unknown.';
        }
    };

    // Use useMemo to compute latestRequest
    const latestRequest = useMemo(() => {
        if (requests.length === 0) return null;
        return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    }, [requests]);

    const handleCancelRequest = useCallback(async (requestId) => {
        if (!window.confirm('Are you sure you want to cancel this ambulance request?')) {
            return;
        }
        
        try {
            setLoading(true);
            console.log('Cancelling request:', requestId);
            const response = await cancelRequest(requestId);
            
            if (response.success || (response.data && response.data.success)) {
                console.log('Request cancelled successfully');
                // Immediately update local state
                setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));
                
                toast.success('Ambulance request cancelled successfully');
                
                // Redirect directly to ambulance page
                navigate('/ambulance');
            } else {
                console.error('Failed to cancel request:', response);
                toast.error('Failed to cancel request. Please try again.');
            }
        } catch (error) {
            console.error('Error cancelling request:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel request. Please try again.');
            // Refresh to make sure UI is updated
            fetchRequests();
        } finally {
            setLoading(false);
        }
    }, [fetchRequests, navigate]);

    // After all hooks are defined, then we can have conditional rendering
    if (loading) {
        return (
            <div className="min-h-[60vh] flex justify-center items-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-primaryColor mx-auto mb-4" />
                    <p className="text-gray-500">Loading your requests...</p>
                </div>
            </div>
        );
    }

    return (
        <section className="pt-[60px] pb-[60px] bg-[#f5f5f5]">
            <div className="container max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-primaryColor">Ambulance Status</h1>
                    {latestRequest && latestRequest.status !== 'completed' ? (
                        <button 
                            onClick={() => handleCancelRequest(latestRequest._id)}
                            className={`flex items-center gap-2 ${
                                latestRequest.status === 'assigned' 
                                ? 'bg-red-600 text-white animate-pulse' 
                                : 'bg-red-500 text-white'
                            } px-4 py-2 rounded-lg hover:bg-red-700`}
                            disabled={loading}
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : <FaTrash />} 
                            {latestRequest.status === 'assigned' ? 'Cancel Assignment' : 'Cancel Request'}
                        </button>
                    ) : (
                        <Link 
                            to="/ambulance" 
                            className="flex items-center gap-2 bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-primaryColor/90"
                        >
                            <FaArrowLeft /> Request Ambulance
                        </Link>
                    )}
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <p>{error}</p>
                        <p className="mt-2">Please try again later or contact support if the issue persists.</p>
                    </div>
                )}

                {!error && !latestRequest && (
                    <div className="bg-white shadow-md rounded-lg p-8 text-center">
                        {successMessage ? (
                            <>
                                <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
                                    <p className="font-medium">{successMessage}</p>
                                </div>
                                <FaAmbulance className="text-6xl text-gray-300 mx-auto mb-4" />
                            </>
                        ) : (
                            <FaAmbulance className="text-6xl text-gray-300 mx-auto mb-4" />
                        )}
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No Active Ambulance Requests</h3>
                        <p className="text-gray-500 mb-6">You don't have any active ambulance requests.</p>
                        <Link 
                            to="/ambulance" 
                            className="inline-block bg-primaryColor text-white px-4 py-2 rounded-md hover:bg-primaryColor/90"
                        >
                            Request an Ambulance
                        </Link>
                    </div>
                )}

                {latestRequest && (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-semibold">{latestRequest.name}</h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Request ID: {latestRequest._id}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        Requested on: {formatDate(latestRequest.createdAt)}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(latestRequest.status)}`}>
                                    {latestRequest.status.charAt(0).toUpperCase() + latestRequest.status.slice(1)}
                                </span>
                            </div>
                            
                            <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                <p className="text-gray-700">
                                    {getStatusMessage(latestRequest.status)}
                                </p>
                            </div>
                        </div>
                        
                        {latestRequest.status === 'assigned' && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <FaAmbulance className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <p className="font-medium text-blue-800">Driver Assigned</p>
                                    <p className="text-blue-700 text-sm">
                                        A driver is on the way to your location. You can still cancel the request if needed.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium mb-4">Request Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <FaPhone className="text-primaryColor mt-1" />
                                    <div>
                                        <p className="text-sm font-medium">Contact</p>
                                        <p className="text-gray-600">{latestRequest.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaMapMarkerAlt className="text-primaryColor mt-1" />
                                    <div>
                                        <p className="text-sm font-medium">Pickup Location</p>
                                        <p className="text-gray-600">{latestRequest.pickupLocation}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MdEmergency className="text-primaryColor mt-1" />
                                    <div>
                                        <p className="text-sm font-medium">Emergency Type</p>
                                        <p className="text-gray-600">{latestRequest.emergencyType}</p>
                                    </div>
                                </div>
                                {latestRequest.preferredHospital && (
                                    <div className="flex items-start gap-3">
                                        <FaHospital className="text-primaryColor mt-1" />
                                        <div>
                                            <p className="text-sm font-medium">Preferred Hospital</p>
                                            <p className="text-gray-600">{latestRequest.preferredHospital}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {latestRequest.driverId ? (
                            <div className="p-6">
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-primaryColor">
                                    <FaAmbulance /> Assigned Driver
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium">Name</p>
                                        <p className="text-gray-600">{latestRequest.driverId.driverName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Phone</p>
                                        <p className="text-gray-600">{latestRequest.driverId.phone}</p>
                                    </div>
                                    {latestRequest.driverId.location && (
                                        <div>
                                            <p className="text-sm font-medium">Location</p>
                                            <p className="text-gray-600">{latestRequest.driverId.location}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-gray-500">No driver assigned yet. Please wait...</p>
                            </div>
                        )}
                    </div>
                )}
                
                {requests.length > 1 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Previous Requests</h3>
                        <div className="space-y-4">
                            {requests
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(1)
                                .map(request => (
                                    <div key={request._id} className="bg-white p-4 rounded-lg shadow-md">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium">{request.name}</p>
                                                <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AmbulanceStatus; 