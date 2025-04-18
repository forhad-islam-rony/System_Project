import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineDashboard, AiOutlineUserAdd } from 'react-icons/ai';
import { FaUserMd, FaUsers, FaUserShield, FaAmbulance } from 'react-icons/fa';
import { BsCalendarCheck } from 'react-icons/bs';
import { RiMedicineBottleLine } from 'react-icons/ri';
import { TbTruckDelivery } from 'react-icons/tb';

const AdminNav = () => {
    const location = useLocation();

    const adminMenus = [
        {
            path: '/admin',
            display: 'Dashboard',
            icon: <AiOutlineDashboard className="text-xl" />
        },
        {
            path: '/admin/doctors',
            display: 'Doctors List',
            icon: <FaUserMd className="text-xl" />
        },
        {
            path: '/admin/add-doctor',
            display: 'Add Doctor',
            icon: <AiOutlineUserAdd className="text-xl" />
        },
        {
            path: '/admin/appointments',
            display: 'Appointments',
            icon: <BsCalendarCheck className="text-xl" />
        },
        {
            path: '/admin/patients',
            display: 'Patients List',
            icon: <FaUsers className="text-xl" />
        },
        {
            path: '/admin/moderators',
            display: 'Manage Moderators',
            icon: <FaUserShield className="text-xl" />
        },
        {
            path: '/admin/medicines',
            display: 'Manage Medicines',
            icon: <RiMedicineBottleLine className="text-xl" />
        },
        {
            path: '/admin/orders',
            display: 'Orders',
            icon: <TbTruckDelivery className="text-xl" />
        },
        {
            path: '/admin/ambulance',
            display: 'Ambulance Service',
            icon: <FaAmbulance className="text-xl" />
        },
    ];

    return (
        <div className="h-screen bg-white shadow-md w-64 fixed left-0 top-0">
            <div className="p-4 border-b">
                <h2 className="text-2xl font-bold text-primaryColor">Admin Panel</h2>
            </div>
            <div className="py-4">
                {adminMenus.map((item, index) => (
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

export default AdminNav; 