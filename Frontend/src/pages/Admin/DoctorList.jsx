import React, { useState, useEffect, useContext } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import { BsThreeDotsVertical } from 'react-icons/bs';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, [token]);

    const fetchDoctors = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/admin/doctors`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch doctors');
            }

            const data = await res.json();
            setDoctors(data);
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const handleApproval = async (doctorId, isApproved) => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/admin/doctors/${doctorId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isApproved })
            });

            if (!res.ok) {
                throw new Error('Failed to update doctor approval status');
            }

            toast.success(`Doctor ${isApproved ? 'approved' : 'moved to pending'} successfully`);
            fetchDoctors();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleAvailabilityChange = async (doctorId, isAvailable) => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/admin/doctors/${doctorId}/availability`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isAvailable })
            });

            if (!res.ok) {
                throw new Error('Failed to update availability status');
            }

            toast.success('Availability updated successfully');
            fetchDoctors();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleActionMenu = (doctorId) => {
        setSelectedDoctor(selectedDoctor === doctorId ? null : doctorId);
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
                        Doctors List ({doctors.length})
                    </h2>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doctor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Specialization
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Experience
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fees
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Available
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {doctors.map((doctor) => (
                                    <tr key={doctor._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={doctor.photo || '/default-doctor.jpg'}
                                                        alt={doctor.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Dr. {doctor.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {doctor.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doctor.specialization}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doctor.experiences?.length || 0} years
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ৳{doctor.ticketPrice}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${doctor.isApproved === 'approved' ? 'bg-green-100 text-green-800' : 
                                                  doctor.isApproved === 'rejected' ? 'bg-red-100 text-red-800' :
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {doctor.isApproved}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={doctor.isAvailable}
                                                    disabled={doctor.isApproved !== 'approved'}
                                                    onChange={(e) => handleAvailabilityChange(doctor._id, e.target.checked)}
                                                />
                                                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                                    peer-focus:ring-blue-300 rounded-full peer 
                                                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                                    after:bg-white after:border-gray-300 after:border after:rounded-full 
                                                    after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600
                                                    ${doctor.isApproved !== 'approved' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                </div>
                                            </label>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="relative">
                                                <button
                                                    onClick={() => toggleActionMenu(doctor._id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <BsThreeDotsVertical className="h-5 w-5" />
                                                </button>
                                                
                                                {selectedDoctor === doctor._id && (
                                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                        <div className="py-1">
                                                            {doctor.isApproved !== 'approved' && (
                                                                <button
                                                                    onClick={() => handleApproval(doctor._id, true)}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                                                                >
                                                                    Approve Doctor
                                                                </button>
                                                            )}
                                                            {doctor.isApproved === 'approved' && (
                                                                <button
                                                                    onClick={() => handleApproval(doctor._id, false)}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                                                >
                                                                    Move to Pending
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
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

export default DoctorList; 