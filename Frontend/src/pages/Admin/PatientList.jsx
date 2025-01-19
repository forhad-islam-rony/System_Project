import React, { useState, useEffect, useContext } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import { FaUserCircle } from 'react-icons/fa';
import { format } from 'date-fns';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/admin/patients`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch patients');
            }

            const result = await res.json();
            if (result.data && Array.isArray(result.data)) {
                setPatients(result.data);
            } else {
                setPatients([]);
            }
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const getLatestAppointment = (appointments) => {
        if (!appointments || appointments.length === 0) return null;
        return appointments.reduce((latest, current) => {
            return new Date(current.appointmentDate) > new Date(latest.appointmentDate) ? current : latest;
        });
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
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Patients List ({patients.length})
                    </h2>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Medical Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Appointments
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Latest Visit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {patients.length > 0 ? (
                                    patients.map((patient) => {
                                        const latestAppointment = getLatestAppointment(patient.appointments);
                                        return (
                                            <tr key={patient._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {patient.photo ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                    src={patient.photo}
                                                                    alt={patient.name}
                                                                />
                                                            ) : (
                                                                <FaUserCircle className="h-10 w-10 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {patient.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {patient.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        Phone: {patient.phone || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Gender: <span className="capitalize">{patient.gender || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900">
                                                            Blood Type: {patient.bloodType || 'N/A'}
                                                        </span>
                                                        <span className={`text-xs mt-1 px-2 inline-flex rounded-full ${
                                                            patient.isDonating 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {patient.isDonating ? 'Blood Donor' : 'Not a Donor'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        Total: {patient.totalAppointments || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Active: {patient.activeAppointments || 0}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {latestAppointment ? (
                                                        <div className="text-sm">
                                                            <div className="text-gray-900">
                                                                {format(new Date(latestAppointment.appointmentDate), 'MMM dd, yyyy')}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                Dr. {latestAppointment.doctor?.name || 'N/A'}
                                                            </div>
                                                            <span className={`text-xs px-2 inline-flex rounded-full ${
                                                                latestAppointment.status === 'finished' 
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : latestAppointment.status === 'cancelled'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {latestAppointment.status}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">No visits yet</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            No patients found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PatientList; 