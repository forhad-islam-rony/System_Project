/**
 * @fileoverview Login Page Component for Healthcare System
 * @description Handles user authentication with email/password, supports both
 * patient and doctor logins with role-based redirection
 * @author Healthcare System Team
 * @version 1.0.0
 */

import React from 'react'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { HashLoader } from 'react-spinners';

/**
 * Login component for user authentication
 * @component
 * @returns {JSX.Element} Login form with email/password inputs
 * @description Provides user authentication with:
 * - Email and password validation
 * - Loading state management
 * - Role-based navigation after login
 * - Error handling with toast notifications
 * - Responsive design for all devices
 */
const Login = () => {

    // Form state for email and password
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // UI state management
    const [loading, setLoading] = useState(false);  // Loading state for API calls
    const navigate = useNavigate();                 // Navigation hook for redirection
    const { login } = useAuth();                    // Authentication context hook

    /**
     * Handle form input changes
     * @function handleInputChange
     * @param {Event} e - Input change event
     * @description Updates form state with new input values using dynamic field names
     */
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value  // Dynamic field update
        });
    };

    /**
     * Handle login form submission
     * @async
     * @function handleLogin
     * @param {Event} e - Form submission event
     * @description Authenticates user with backend, handles success/error states,
     * and navigates based on user role (doctor/patient)
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);  // Show loading spinner

        try {
            // Make API call to authentication endpoint
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)  // Send email/password
            });

            // Parse API response
            const result = await res.json();

            // Handle API errors
            if (!res.ok) {
                throw new Error(result.message);
            }

            // Store authentication data in context
            login(result.data, result.token);
            
            // Show success message
            toast.success(result.message);
            
            // Role-based navigation after successful login
            if (result.data.role === 'doctor') {
                navigate('/doctors/profile/me');  // Doctor dashboard
            } else {
                navigate('/users/profile/me');    // Patient dashboard
            }

        } catch (error) {
            // Show error message for failed login
            toast.error(error.message);
        } finally {
            // Reset loading state regardless of outcome
            setLoading(false);
        }
    };

    return (
      <section className="px-5 lg:px-0">
        <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10">
          <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
            Hello! <span className="text-primaryColor">Welcome</span> Back 🎉
          </h3>

          <form className="py-4 md:py-0" onSubmit={handleLogin}>
            <div className="mb-5">
              <input 
                type="email" 
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[22px] leading-7 text-headingColor placeholder:text-textColor rounded-md cursor-pointer"
                required 
              />
            </div>

            <div className="mb-5">
              <input 
                type="password"
                placeholder="Enter your Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[22px] leading-7 text-headingColor placeholder:text-textColor rounded-md cursor-pointer"
                required 
              />
            </div>

            <div className="mt-7">
              <button 
                type="submit"
                className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3"
              >
                {loading ? <HashLoader size={25} color="#fff" /> : "Login"}
              </button>
            </div>

            <p className="mt-5 text-textColor text-center">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primaryColor font-medium ml-1">
                Register
              </Link>
            </p>
          </form>
        </div>
      </section>
    );
}

export default Login