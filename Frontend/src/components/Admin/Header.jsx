import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        try {
            // Clear token and any admin-specific data
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            
            toast.success('Logged out successfully');
            navigate('/admin/login');
        } catch (err) {
            toast.error('Something went wrong');
        }
    };

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header; 