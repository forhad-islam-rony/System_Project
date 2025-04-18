import React, { useState, useEffect } from 'react';
import { getUserRequests } from '../services/ambulanceService';
import { FaAmbulance, FaPhone, FaMapMarkerAlt, FaHospital, FaSpinner } from 'react-icons/fa';
import { MdEmergency } from 'react-icons/md';
import toast from 'react-hot-toast';

const AmbulanceHistory = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const response = await getUserRequests();
                setRequests(response.data || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching requests:', err);
                setError('Failed to fetch your ambulance requests');
                toast.error('Could not load your ambulance request history');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-primaryColor" />
            </div>
        );
    }

    return (
        <section className="pt-[60px] pb-[60px] bg-[#f5f5f5]">
            <div className="container">
                <h1 className="heading mb-8">Your Ambulance Request History</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <p>{error}</p>
                    </div>
                )}

                {!error && requests.length === 0 ? (
                    <div className="bg-white shadow-md rounded-lg p-8 text-center">
                        <FaAmbulance className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No Ambulance Requests Found</h3>
                        <p className="text-gray-500">You haven't requested any ambulance services yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {requests.map((request) => (
                            <div 
                                key={request._id} 
                                className="bg-white shadow-md rounded-lg p-6 border-l-4 border-primaryColor"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold">{request.name}</h3>
                                        <p className="text-gray-500 text-sm mt-1">Requested on: {formatDate(request.createdAt)}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="flex items-start gap-2">
                                        <FaPhone className="text-primaryColor mt-1" />
                                        <div>
                                            <p className="text-sm font-medium">Contact</p>
                                            <p className="text-sm text-gray-600">{request.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="text-primaryColor mt-1" />
                                        <div>
                                            <p className="text-sm font-medium">Pickup Location</p>
                                            <p className="text-sm text-gray-600">{request.pickupLocation}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MdEmergency className="text-primaryColor mt-1" />
                                        <div>
                                            <p className="text-sm font-medium">Emergency Type</p>
                                            <p className="text-sm text-gray-600">{request.emergencyType}</p>
                                        </div>
                                    </div>
                                    {request.preferredHospital && (
                                        <div className="flex items-start gap-2">
                                            <FaHospital className="text-primaryColor mt-1" />
                                            <div>
                                                <p className="text-sm font-medium">Preferred Hospital</p>
                                                <p className="text-sm text-gray-600">{request.preferredHospital}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {request.driverId && (
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <h4 className="font-medium flex items-center gap-2 text-primaryColor">
                                            <FaAmbulance /> Assigned Driver
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <p className="text-sm text-gray-600">Name: <span className="font-medium">{request.driverId.driverName}</span></p>
                                            <p className="text-sm text-gray-600">Phone: <span className="font-medium">{request.driverId.phone}</span></p>
                                            {request.driverId.location && (
                                                <p className="text-sm text-gray-600">Location: <span className="font-medium">{request.driverId.location}</span></p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AmbulanceHistory; 