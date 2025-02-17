import React from 'react';
import ModeratorNav from './ModeratorNav';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ModeratorLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <ModeratorNav />
            <div className="flex-1 ml-64 overflow-hidden">
                {/* Add Logout Button */}
                <div className="p-4 flex justify-end">
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>
                <div className="p-4 h-screen overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModeratorLayout; 