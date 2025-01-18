import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Contact from './pages/Contact';
import About from './pages/About';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Myprofile from './pages/Myprofile';
import Myappointments from './pages/MyAppointments';
import Appointment from './pages/Appointment';
import Footer from './pages/Footer';
import Register from './pages/Register';
import DoctorsDetails from './pages/DoctorsDetails';
import MyAccount from './Dashboard/user-account/MyAccount';
import DoctorAccount from './Dashboard/doctor-account/DoctorAccount';
import Pharmacy from './pages/Pharmacy';
import MedicineDetails from './pages/MedicineDetails';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <div className='mx-4 sm:max-[10%]'>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          
          {/* Auth Routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          
          {/* Doctor Routes */}
          <Route path='/doctors' element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorsDetails />} />
          <Route path='/doctors/speciality/:speciality' element={<Doctors />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          
          {/* Protected Doctor Route */}
          <Route 
            path='/doctors/profile/me' 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorAccount />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected User Route */}
          <Route 
            path='/users/profile/me' 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MyAccount />
              </ProtectedRoute>
            } 
          />
          
          {/* User Routes */}
          <Route path='/myprofile' element={<Myprofile />} />
          <Route path='/myappointments' element={<Myappointments />} />
          
          {/* Pharmacy Route */}
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/pharmacy/:id" element={<MedicineDetails />} />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
