import React, { useState, useEffect } from 'react';
import {
    getAllDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
    getAllRequests,
    assignDriver,
    completeRequest
} from '../services/ambulanceService';

const AdminAmbulanceDashboard = () => {
    const [drivers, setDrivers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDriverForm, setShowDriverForm] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [driverForm, setDriverForm] = useState({
        driverName: '',
        phone: '',
        licenseNumber: '',
        address: '',
        location: '',
        status: 'available'
    });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [driversResponse, requestsResponse] = await Promise.all([
                getAllDrivers(),
                getAllRequests()
            ]);
            setDrivers(driversResponse.data);
            setRequests(requestsResponse.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDriverSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedDriver) {
                await updateDriver(selectedDriver._id, driverForm);
            } else {
                await createDriver(driverForm);
            }
            setShowDriverForm(false);
            setSelectedDriver(null);
            setDriverForm({
                driverName: '',
                phone: '',
                licenseNumber: '',
                address: '',
                location: '',
                status: 'available'
            });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save driver');
        }
    };

    const handleEditDriver = (driver) => {
        setSelectedDriver(driver);
        setDriverForm(driver);
        setShowDriverForm(true);
    };

    const handleDeleteDriver = async (id) => {
        if (window.confirm('Are you sure you want to delete this driver?')) {
            try {
                await deleteDriver(id);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete driver');
            }
        }
    };

    const handleAssignDriver = async (requestId, driverId) => {
        try {
            await assignDriver(requestId, driverId);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign driver');
        }
    };

    const handleCompleteRequest = async (requestId, driverId) => {
        try {
            await completeRequest(requestId, driverId);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete request');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Ambulance Dashboard</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Drivers Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Drivers</h2>
                        <button
                            onClick={() => setShowDriverForm(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            Add Driver
                        </button>
                    </div>

                    {showDriverForm && (
                        <div className="bg-white shadow rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold mb-4">
                                {selectedDriver ? 'Edit Driver' : 'Add New Driver'}
                            </h3>
                            <form onSubmit={handleDriverSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        name="driverName"
                                        value={driverForm.driverName}
                                        onChange={(e) => setDriverForm({ ...driverForm, driverName: e.target.value })}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={driverForm.phone}
                                        onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        value={driverForm.licenseNumber}
                                        onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={driverForm.address}
                                        onChange={(e) => setDriverForm({ ...driverForm, address: e.target.value })}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={driverForm.location}
                                        onChange={(e) => setDriverForm({ ...driverForm, location: e.target.value })}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        name="status"
                                        value={driverForm.status}
                                        onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="available">Available</option>
                                        <option value="busy">Busy</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDriverForm(false);
                                            setSelectedDriver(null);
                                            setDriverForm({
                                                driverName: '',
                                                phone: '',
                                                licenseNumber: '',
                                                address: '',
                                                location: '',
                                                status: 'available'
                                            });
                                        }}
                                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                    >
                                        {selectedDriver ? 'Update' : 'Add'} Driver
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {drivers.map((driver) => (
                            <div key={driver._id} className="bg-white shadow rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold">{driver.driverName}</h3>
                                        <p className="text-gray-600">Phone: {driver.phone}</p>
                                        <p className="text-gray-600">License: {driver.licenseNumber}</p>
                                        <p className="text-gray-600">Location: {driver.location}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            driver.status === 'available' ? 'bg-green-100 text-green-800' :
                                            driver.status === 'busy' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                                        </span>
                                        <button
                                            onClick={() => handleEditDriver(driver)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDriver(driver._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Requests Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Requests</h2>
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request._id} className="bg-white shadow rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold">{request.name}</h3>
                                        <p className="text-gray-600">Phone: {request.phone}</p>
                                        <p className="text-gray-600">Location: {request.pickupLocation}</p>
                                        <p className="text-gray-600">Emergency: {request.emergencyType}</p>
                                        <p className="text-gray-600">Hospital: {request.preferredHospital}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            request.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                {request.status === 'pending' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign Driver
                                        </label>
                                        <select
                                            onChange={(e) => handleAssignDriver(request._id, e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Select a driver</option>
                                            {drivers
                                                .filter(driver => driver.status === 'available')
                                                .map(driver => (
                                                    <option key={driver._id} value={driver._id}>
                                                        {driver.driverName} - {driver.location}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}
                                {request.status === 'assigned' && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleCompleteRequest(request._id, request.driverId._id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                        >
                                            Mark as Completed
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAmbulanceDashboard; 