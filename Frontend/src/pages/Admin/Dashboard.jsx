import React from 'react';
import Header from '../../components/Admin/Header';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Dashboard Cards */}
                        <Link 
                            to="/admin/doctors"
                            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="ml-5">
                                    <h3 className="text-lg font-medium text-gray-900">Doctors</h3>
                                    <p className="text-sm text-gray-500">Manage all doctors</p>
                                </div>
                            </div>
                        </Link>

                        <Link 
                            to="/admin/patients"
                            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5">
                                    <h3 className="text-lg font-medium text-gray-900">Patients</h3>
                                    <p className="text-sm text-gray-500">View all patients</p>
                                </div>
                            </div>
                        </Link>

                        <Link 
                            to="/admin/appointments"
                            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-5">
                                    <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
                                    <p className="text-sm text-gray-500">View all appointments</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard; 