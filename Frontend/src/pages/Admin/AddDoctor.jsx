import React, { useState } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/Admin/AdminLayout';

const AddDoctor = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        experience: '',
        feePerConsultation: '',
        timeSlots: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/admin/doctors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Doctor added successfully');
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    specialization: '',
                    experience: '',
                    feePerConsultation: '',
                    timeSlots: '',
                });
            }
        } catch (error) {
            toast.error('Failed to add doctor');
        }
    };

    return (
        <AdminLayout>
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-6">Add New Doctor</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Experience (years)</label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Fee Per Consultation</label>
                                <input
                                    type="number"
                                    name="feePerConsultation"
                                    value={formData.feePerConsultation}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Time Slots</label>
                                <input
                                    type="text"
                                    name="timeSlots"
                                    value={formData.timeSlots}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    placeholder="e.g., 9:00-17:00"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-6 bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark"
                        >
                            Add Doctor
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AddDoctor; 