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
import Pharmacy from './pages/Pharmacy';

export const App = () => {
  return (
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
        
        {/* User Routes */}
        <Route path='/myprofile' element={<Myprofile />} />
        <Route path='/myappointments' element={<Myappointments />} />
        <Route path='/users/profile/me' element={<MyAccount />} />
        
        {/* Pharmacy Route */}
        <Route path="/pharmacy" element={<Pharmacy />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
