import React from 'react';
import AdminNav from './AdminNav';

const AdminLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminNav />
            <div className="flex-1 ml-64">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout; 