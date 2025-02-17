import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';
import uploadImageToCloudinary from '../utils/uploadCloudinary';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';

const MyProfile = () => {
  const { user, token, dispatch } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    photo: null,
    gender: '',
    bloodType: '',
    phone: '',
    isDonating: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        photo: user.photo || null,
        gender: user.gender || '',
        bloodType: user.bloodType || '',
        phone: user.phone || '',
        isDonating: user.isDonating || false
      });
    }
  }, [user]);

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = async event => {
    const file = event.target.files[0];
    if(!file) return;

    try {
      setLoading(true);
      const data = await uploadImageToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        photo: data.url
      }));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Error uploading image');
    }
  };

  const toggleDonating = () => {
    setFormData(prev => ({
      ...prev,
      isDonating: !prev.isDonating
    }));
  };

  const submitHandler = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/users/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setLoading(false);
      toast.success('Successfully updated');

      // Update stored user data
      dispatch({
        type: 'UPDATE_USER',
        payload: {
          user: result.data,
          token
        }
      });

    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  return (
    <div className='max-w-[1170px] px-5 mx-auto'>
      <div className="rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
        
        <form onSubmit={submitHandler}>
          <div className="mb-5">
            <input
              type="file"
              name="photo"
              id="customFile"
              onChange={handleFileInputChange}
              accept=".jpg, .jpeg, .png"
              className="hidden"
            />
            <label
              htmlFor="customFile"
              className="block w-[60px] h-[60px] cursor-pointer mx-auto mb-3"
            >
              <img
                src={formData.photo || user?.photo}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            </label>
          </div>

          <div className="mb-5">
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-md"
            />
          </div>

          <div className="mb-5">
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-md"
              disabled
            />
          </div>

          <div className="mb-5">
            <input
              type="text"
              placeholder="Phone number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-md"
            />
          </div>

          <div className="mb-5">
            <label className="text-headingColor font-bold text-[16px] leading-7">
              Gender:
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <div className="mb-5">
            <label className="text-headingColor font-bold text-[16px] leading-7">
              Blood Type:
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleInputChange}
                className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </label>
          </div>

          <div className="mt-7">
            <button
              type="submit"
              className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3"
              disabled={loading}
            >
              {loading ? <HashLoader size={25} color="#ffffff" /> : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;