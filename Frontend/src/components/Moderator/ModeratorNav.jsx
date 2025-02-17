import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineDashboard } from 'react-icons/ai';
import { MdPendingActions } from 'react-icons/md';

const ModeratorNav = () => {
    const location = useLocation();
    const moderatorInfo = JSON.parse(localStorage.getItem('user'));

    const menuItems = [
        {
            path: '/moderator/dashboard',
            name: 'Dashboard',
            icon: <AiOutlineDashboard size={20} />
        },
        {
            path: '/moderator/pending-posts',
            name: 'Pending Posts',
            icon: <MdPendingActions size={20} />
        }
    ];

    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-primaryColor">Moderator Panel</h2>
                <p className="text-sm text-gray-600 mt-1">{moderatorInfo?.division} Division</p>
            </div>
            
            <nav className="mt-6">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition-colors ${
                            location.pathname === item.path ? 'bg-blue-50 text-primaryColor border-r-4 border-primaryColor' : 'text-gray-700'
                        }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default ModeratorNav; 