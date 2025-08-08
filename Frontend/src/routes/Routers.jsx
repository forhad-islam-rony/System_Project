import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Contact from '../pages/Contact';
import Services from '../pages/Services';
import DoctorDetails from '../pages/Doctors/DoctorDetails';
import DoctorAccount from '../pages/Doctors/DoctorAccount';
import BloodGroup from '../pages/BloodGroup';
import Community from '../pages/Community';
import ReviewPage from '../pages/ReviewPage';
import ManageModerators from '../pages/Admin/ManageModerators';
import ManageMedicines from '../pages/Admin/ManageMedicines';

// Admin imports
import Dashboard from '../pages/Admin/Dashboard';
import DoctorList from '../pages/Admin/DoctorList';
import AddDoctor from '../pages/Admin/AddDoctor';
import AdminLogin from '../pages/Admin/Login';
import AdminRegister from '../pages/Admin/Register';
import Appointments from '../pages/Admin/Appointments';

const Routers = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/review" element={<ReviewPage />} />
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
            <Route 
                path="/admin/appointments" 
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Appointments />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/admin/moderators" 
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ManageModerators />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/admin/medicines" 
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ManageMedicines />
                    </ProtectedRoute>
                }
            />
            <Route path="/blood-group" element={<BloodGroup />} />
            <Route path="/community" element={<Community />} />
        </Routes>
    );
};

export default Routers; 