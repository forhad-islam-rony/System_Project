import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineDashboard } from 'react-icons/ai';
import { FaHospital, FaUserMd } from 'react-icons/fa';

const ModeratorNav = () => {
    const location = useLocation();

    const moderatorMenus = [
        {
            path: '/moderator',
            display: 'Dashboard',
            icon: <AiOutlineDashboard className="text-xl" />
        },
        {
            path: '/moderator/hospitals',
            display: 'Hospitals',
            icon: <FaHospital className="text-xl" />
        },
        {
            path: '/moderator/doctors',
            display: 'Doctors',
            icon: <FaUserMd className="text-xl" />
        }
    ];

    return (
        <div className="h-screen bg-white shadow-md w-64 fixed left-0 top-0">
            <div className="p-4 border-b">
                <h2 className="text-2xl font-bold text-primaryColor">Moderator Panel</h2>
            </div>
            <div className="py-4">
                {moderatorMenus.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-50 transition-colors ${
                            location.pathname === item.path
                                ? 'bg-blue-50 text-primaryColor border-r-4 border-primaryColor'
                                : 'text-gray-700'
                        }`}
                    >
                        {item.icon}
                        <span className="font-medium">{item.display}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ModeratorNav; 