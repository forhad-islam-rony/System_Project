import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        recentAppointments: []
    });
    
    const { token, role } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not admin
        if (!token || role !== 'admin') {
            navigate('/admin/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/v1/admin/dashboard-stats`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (!res.ok) {
                    throw new Error('Failed to fetch dashboard stats');
                }
                
                const data = await res.json();
                setStats(data);
            } catch (error) {
                toast.error(error.message);
            }
        };

        fetchStats();
    }, [token, role, navigate]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600">Total Doctors</h3>
                        <p className="text-3xl font-bold text-primaryColor mt-2">{stats.totalDoctors}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600">Total Patients</h3>
                        <p className="text-3xl font-bold text-primaryColor mt-2">{stats.totalPatients}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600">Total Appointments</h3>
                        <p className="text-3xl font-bold text-primaryColor mt-2">{stats.totalAppointments}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Appointments</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2">Patient</th>
                                    <th className="px-4 py-2">Doctor</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentAppointments.map((appointment) => (
                                    <tr key={appointment._id}>
                                        <td className="border px-4 py-2">{appointment.user.name}</td>
                                        <td className="border px-4 py-2">{appointment.doctor.name}</td>
                                        <td className="border px-4 py-2">
                                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                                        </td>
                                        <td className="border px-4 py-2">{appointment.status}</td>
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

export default Dashboard; 