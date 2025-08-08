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
import AdminLogin from './pages/Admin/Login';
import AdminRegister from './pages/Admin/Register';
import Dashboard from './pages/Admin/Dashboard';
import DoctorList from './pages/Admin/DoctorList';
import AddDoctor from './pages/Admin/AddDoctor';
import Appointments from './pages/Admin/Appointments';
import PatientList from './pages/Admin/PatientList';
import BloodGroup from './pages/BloodGroup';
import Community from './pages/Community';
import ModeratorLogin from './pages/Moderator/Login';
import ManageModerators from './pages/Admin/ManageModerators';
import ModeratorDashboard from './pages/Moderator/Dashboard';
import PendingPosts from './pages/Moderator/PendingPosts';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import ManageMedicines from './pages/Admin/ManageMedicines';
import { CartProvider } from './context/CartContext';
import ConditionalCartIcon from './components/Cart/ConditionalCartIcon';
import CrispChatController from './components/CrispChatController';
import ManageOrders from './pages/Admin/ManageOrders';
import Inquiry from './pages/Admin/Inquiry';
import Ambulance from './pages/Ambulance';
import AmbulanceStatus from './pages/AmbulanceStatus';
import AdminAmbulanceDashboard from './pages/Admin/AdminAmbulanceDashboard';
import ManageDriversPage from './pages/Admin/ManageDriversPage';
import MedicalChatbot from './pages/MedicalChatbot.jsx';
import ReviewPage from './pages/ReviewPage';
import { useEffect } from 'react';

export const App = () => {
  
  // Global click handler for all links to ensure scroll to top
  useEffect(() => {
    const handleLinkClick = (e) => {
      // Check if clicked element is a link or inside a link
      const link = e.target.closest('a');
      if (link && link.href && !link.href.includes('#')) {
        // Small delay to ensure navigation happens first
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleLinkClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <CrispChatController />
        <div className='mx-4 sm:max-[10%]'>
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="/moderator/*" element={null} />
            <Route path="*" element={<Navbar />} />
          </Routes>

          <Routes>
            {/* Public Routes */}
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/blood-group' element={<BloodGroup />} />
            <Route path='/community' element={<Community />} />
            <Route path='/ambulance' element={<Ambulance />} />
            <Route path='/ambulance-status' element={<AmbulanceStatus />} />
            <Route path='/medical-chatbot' element={<MedicalChatbot />} />
            <Route path='/review' element={<ReviewPage />} />
            
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

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
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
              path="/admin/patients" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PatientList />
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
                  <AdminLayout>
                    <ManageMedicines />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <ManageOrders />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ambulance" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminAmbulanceDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ambulance/drivers" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <ManageDriversPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/inquiries" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Inquiry />
                </ProtectedRoute>
              } 
            />

            {/* Moderator Routes */}
            <Route path="/moderator/login" element={<ModeratorLogin />} />
            <Route 
              path="/moderator/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['moderator']}>
                  <ModeratorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/moderator/pending-posts" 
              element={
                <ProtectedRoute allowedRoles={['moderator']}>
                  <PendingPosts />
                </ProtectedRoute>
              } 
            />
          </Routes>

          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="/moderator/*" element={null} />
            <Route path="*" element={<Footer />} />
          </Routes>
        </div>
        <ConditionalCartIcon />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
