import React, { useState, useEffect, useContext } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { format, parseISO } from 'date-fns';

const formatAppointmentDateTime = (dateString, timeSlot) => {
    try {
        const date = parseISO(dateString);
        return {
            date: format(date, 'MMM dd, yyyy'),
            time: timeSlot || 'No time specified'
        };
    } catch (error) {
        return { date: 'Invalid Date', time: 'Invalid Time' };
    }
};

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/admin/appointments`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch appointments');
            }

            const data = await res.json();
            
            // Ensure we have unique appointments
            const uniqueAppointments = [...new Map(data.map(item => 
                [item._id, item]
            )).values()];
            
            setAppointments(uniqueAppointments);
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectedAppointment && !event.target.closest('.action-menu')) {
                setSelectedAppointment(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedAppointment]);

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/admin/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                throw new Error('Failed to update appointment status');
            }

            toast.success(`Appointment ${newStatus} successfully`);
            fetchAppointments(); // Refresh the list
            setSelectedAppointment(null);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleActionMenu = (appointmentId) => {
        setSelectedAppointment(selectedAppointment === appointmentId ? null : appointmentId);
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
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Appointments ({appointments.length})
                </h2>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {appointments.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No appointments found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Age
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Appointment Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Appointment Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Doctor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fees
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.map((appointment) => {
                                        const { date, time } = formatAppointmentDateTime(
                                            appointment.appointmentDate,
                                            appointment.appointmentTime
                                        );
                                        return (
                                            <tr key={appointment._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={appointment.user?.photo || '/default-avatar.jpg'}
                                                                alt={appointment.user?.name}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {appointment.user?.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {appointment.user?.age || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{date}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{time}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 flex-shrink-0">
                                                            <img
                                                                className="h-8 w-8 rounded-full object-cover"
                                                                src={appointment.doctor?.photo || '/default-doctor.jpg'}
                                                                alt={appointment.doctor?.name}
                                                            />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                Dr. {appointment.doctor?.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {appointment.doctor?.specialization}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        ৳{appointment.ticketPrice}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                                          'bg-red-100 text-red-800'}`}>
                                                        {appointment.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="relative action-menu">
                                                        <button
                                                            onClick={() => toggleActionMenu(appointment._id)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            <BsThreeDotsVertical className="h-5 w-5" />
                                                        </button>
                                                        
                                                        {selectedAppointment === appointment._id && (
                                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                                <div className="py-1">
                                                                    {appointment.status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                                                                                className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                                                                            >
                                                                                Confirm Appointment
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                                                                                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                                                            >
                                                                                Cancel Appointment
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {appointment.status === 'confirmed' && (
                                                                        <button
                                                                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                                                                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                                                        >
                                                                            Cancel Appointment
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Appointments; 