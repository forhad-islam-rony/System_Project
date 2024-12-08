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
import "./App.css";
import Footer from './pages/Footer';
import Register from './pages/Register';

export const App = () => {
  return (
    <div className='mx-4 sm:max-[10%]'>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/about' element={<About />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/doctors/:speciality' element={<Doctors />} /> {/* Fixed */}
        <Route path='/myprofile' element={<Myprofile />} />
        <Route path='/myappointments' element={<Myappointments />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
      </Routes>
      <section>
      <Footer />
      </section>
    </div>
  );
};

export default App;
