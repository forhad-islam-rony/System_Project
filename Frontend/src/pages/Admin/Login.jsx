import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { dispatch } = useContext(AuthContext);

    const handleInputChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Attempting admin login with:', formData);

            const res = await fetch(`${BASE_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            console.log('Admin login response:', result);

            if (!res.ok) {
                throw new Error(result.message);
            }

            // Verify admin role
            if (result.data.role !== 'admin') {
                throw new Error('Unauthorized - Admin access only');
            }

            // Update auth context
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: result.data,
                    token: result.token,
                    role: 'admin'
                }
            });

            // Store admin info in localStorage
            localStorage.setItem('token', result.token);
            localStorage.setItem('role', 'admin');
            localStorage.setItem('user', JSON.stringify(result.data));

            toast.success('Successfully logged in as admin');
            navigate('/admin/dashboard');

        } catch (err) {
            console.error('Admin login error:', err);
            toast.error(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-[570px] mx-auto bg-white rounded-lg shadow-md p-10">
                <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10 text-center">
                    Admin Login
                </h3>

                <form className="py-4 md:py-0" onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <input
                            type="email"
                            placeholder="Enter Your Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-md cursor-pointer"
                            required
                        />
                    </div>

                    <div className="mb-5">
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-md cursor-pointer"
                            required
                        />
                    </div>

                    <div className="mt-7">
                        <button
                            type="submit"
                            className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3"
                            disabled={loading}
                        >
                            {loading ? <span>Loading...</span> : <span>Login</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin; 