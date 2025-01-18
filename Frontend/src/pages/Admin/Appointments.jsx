import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-hot-toast';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError(null);

            // First check if server is running
            try {
                const testRes = await fetch(`${BASE_URL}/test`);
                if (!testRes.ok) {
                    throw new Error('Server is not responding');
                }
            } catch (err) {
                throw new Error('Cannot connect to server. Please check if server is running.');
            }

            const res = await fetch(`${BASE_URL}/api/v1/admin/appointments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('API endpoint not found');
                }
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to fetch appointments');
            }

            const result = await res.json();
            console.log('API Response:', result);

            if (result.success && Array.isArray(result.data)) {
                setAppointments(result.data);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError(err.message);
            toast.error(err.message);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">All Appointments</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Doctor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {appointments && appointments.length > 0 ? (
                            appointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {appointment.user?.photo && (
                                                <img
                                                    className="h-10 w-10 rounded-full mr-3"
                                                    src={appointment.user.photo}
                                                    alt={appointment.user.name}
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appointment.user?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.user?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {appointment.doctor?.name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {appointment.doctor?.specialization || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {appointment.appointmentTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${appointment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                    No appointments found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Appointments; 