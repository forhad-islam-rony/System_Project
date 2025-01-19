import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config';
import uploadImageToCloudinary from '../../utils/uploadCloudinary';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';

const Profile = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    photo: null,
    gender: '',
    bloodType: '',
    phone: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/users/profile/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          _id: result.data._id,
          name: result.data.name || '',
          email: result.data.email || '',
          photo: result.data.photo || null,
          gender: result.data.gender || '',
          bloodType: result.data.bloodType || '',
          phone: result.data.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message || 'Failed to fetch user data');
    }
  };

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = async event => {
    const file = event.target.files[0];
    const data = await uploadImageToCloudinary(file);
    setSelectedFile(data.url);
    setFormData({ ...formData, photo: data.url });
  };

  const submitHandler = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/users/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          photo: formData.photo,
          gender: formData.gender,
          bloodType: formData.bloodType
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setLoading(false);
      toast.success('Profile updated successfully');
      
      // Call the onUpdate prop to refresh parent component
      if (props.onUpdate) {
        props.onUpdate();
      }

    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <div className='mt-10'>
      <form onSubmit={submitHandler}>
        <div className="mb-5">
          <label htmlFor="photo" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
            Profile Photo
          </label>
          <div className="flex items-center gap-3">
            {formData.photo && (
              <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
                <img
                  src={formData.photo}
                  alt="Preview"
                  className="w-full h-full rounded-full object-cover"
                />
              </figure>
            )}

            <div className="relative w-[130px] h-[50px]">
              <input
                type="file"
                name="photo"
                id="photo"
                onChange={handleFileInputChange}
                accept=".jpg,.png"
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
              <label
                htmlFor="photo"
                className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer"
              >
                Upload Photo
              </label>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="name" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
            readOnly
          />
        </div>

        <div className="mb-5">
          <label htmlFor="phone" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="bloodType" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
            Blood Type
          </label>
          <select
            name="bloodType"
            value={formData.bloodType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
          >
            <option value="">Select Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
            Gender
          </label>
          <div className="flex gap-5">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              Male
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              Female
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="other"
                checked={formData.gender === 'other'}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              Other
            </label>
          </div>
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
  );
};

export default Profile;