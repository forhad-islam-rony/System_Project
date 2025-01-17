import React from 'react'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { HashLoader } from 'react-spinners';

const Login = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message);
            }

            // Use the login function from context
            login(result.data, result.token);
            
            toast.success(result.message);
            
            // Navigate based on role
            if (result.data.role === 'doctor') {
                navigate('/doctors/profile/me');
            } else {
                navigate('/users/profile/me');
            }

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return <section className='px-5 lg:px-0'>
      <div className='w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10'>
        <h3 className='text-headingColor text-[22px] leading-9 font-bold mb-10'>
          Hello! <span className='text-primaryColor'>Welcome</span>Back 🎉
        </h3>

         <form className='py-4 md:py-0' onSubmit={handleLogin}>
            <div className='mb-5'>
              <input type="email" placeholder='Enter your email' name='email' value={formData.email} onChange={handleInputChange} className='w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[22p] leading-7 text-headingColor placeholder:text-textColor rounded-md cursor-pointer'
              required />
            </div>
            <div className='mb-5'>
              <input type="password" placeholder='Enter your Password' name='password' value={formData.password
              } onChange={handleInputChange} className='w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[22p] leading-7 text-headingColor placeholder:text-textColor rounded-md cursor-pointer'
              required />
            </div>

            <div className='mt-7'>
               <button type='submit' className='w-full bg-primaryColor text-white text-[18px]leading-[30px] rounded-lg px-4 py-3'>
                { loading ? <HashLoader size={25} color='#fff' /> : 'Login'}
                </button>
            </div>

            <p className='mt-5 text-textColor text-center'>Don't have an account? <Link to='/register' className='text-primaryColor font-medium ml-1' >Register</Link></p>
         </form>
      </div>
    </section>
}

export default Login