import React from 'react';
import AdminNav from './AdminNav';
import { FaEnvelope } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
    const menuItems = [
        {
            path: '/admin/inquiries',
            icon: <FaEnvelope />,
            label: 'Inquiries'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminNav />
            <div className="flex-1 ml-64 overflow-hidden">
                <div className="p-4 h-screen overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout; 