import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Contact from '../pages/Contact';
import Services from '../pages/Services';
import DoctorDetails from '../pages/Doctors/DoctorDetails';
import DoctorAccount from '../pages/Doctors/DoctorAccount';

// Admin imports
import Dashboard from '../pages/Admin/Dashboard';
import DoctorList from '../pages/Admin/DoctorList';
import AddDoctor from '../pages/Admin/AddDoctor';
import AdminLogin from '../pages/Admin/Login';
import AdminRegister from '../pages/Admin/Register';

const Routers = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            
            {/* Doctor Routes */}
            <Route 
                path="/doctors/profile/me" 
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorAccount />
                    </ProtectedRoute>
                } 
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
                path="/admin/register" 
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminRegister />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/admin" 
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/admin/doctors" 
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <DoctorList />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/admin/add-doctor" 
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AddDoctor />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default Routers; 