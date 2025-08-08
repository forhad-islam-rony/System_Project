import React, { useState, useEffect, useContext } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import { format } from 'date-fns';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/appointments`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch appointments');
            }

            const result = await res.json();
            
            if (result.data && Array.isArray(result.data)) {
                setAppointments(result.data);
            } else {
                setAppointments([]);
                console.log('Invalid data format:', result);
            }
            
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setAppointments([]);
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId, status) => {
        try {
            const res = await fetch(`${BASE_URL}/admin/appointments/${appointmentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update appointment status');
            }

            const result = await res.json();
            if (result.success) {
                toast.success('Appointment status updated successfully');
                fetchAppointments(); // Refresh the appointments list
            }
        } catch (error) {
            console.error('Error updating appointment status:', error);
            toast.error(error.message || 'Failed to update appointment status');
        }
    };

    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'finished':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <h2 className="text-2xl font-bold mb-4">Appointments Management</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doctor
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.map((appointment) => (
                                    <tr key={appointment._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8">
                                                    <img 
                                                        className="h-8 w-8 rounded-full" 
                                                        src={appointment.user?.photo || "/default-avatar.jpg"} 
                                                        alt="" 
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {appointment.user?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900">
                                                {appointment.doctor?.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {appointment.doctor?.specialization}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900">
                                                {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {appointment.appointmentTime}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <select
                                                value={appointment.status}
                                                onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                                                className="text-sm border rounded p-1 focus:outline-none focus:border-primaryColor"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="finished">Finished</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Appointments; 