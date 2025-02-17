import React, { useState, useEffect, useContext } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import { FaUserInjured, FaUserMd, FaCalendarCheck, FaMoneyBillWave } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalEarnings: 0,
        recentAppointments: []
    });
    const [loading, setLoading] = useState(true);
    const { token, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            console.log('Fetching dashboard stats...');
            const res = await fetch(`${BASE_URL}/admin/dashboard-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await res.json();
            console.log('Dashboard stats response:', result);

            if (!res.ok) {
                throw new Error(result.message);
            }

            setStats(result.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error(error.message || 'Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/admin/login');
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
                {/* Header with Logout */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <BiLogOut className="text-xl" />
                        Logout
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Patients</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalPatients}</h3>
                            </div>
                            <FaUserInjured className="text-3xl text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Doctors</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalDoctors}</h3>
                            </div>
                            <FaUserMd className="text-3xl text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Appointments</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</h3>
                            </div>
                            <FaCalendarCheck className="text-3xl text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Earnings</p>
                                <h3 className="text-2xl font-bold text-gray-800">৳{stats.totalEarnings}</h3>
                            </div>
                            <FaMoneyBillWave className="text-3xl text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold text-gray-800">Recent Appointments</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.recentAppointments.map((appointment) => (
                                    <tr key={appointment._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8">
                                                    <img
                                                        className="h-8 w-8 rounded-full"
                                                        src={appointment.user?.photo || '/default-avatar.jpg'}
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">Dr. {appointment.doctor?.name}</div>
                                            <div className="text-sm text-gray-500">{appointment.doctor?.specialization}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${appointment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ৳{appointment.fee}
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

export default AdminDashboard; 