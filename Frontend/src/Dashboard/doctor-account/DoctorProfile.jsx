import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import uploadImageToCloudinary from '../../utils/uploadCloudinary';
import { BASE_URL, token } from '../../config';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';
import { doctorInstance } from '../../utils/axiosConfig';

const DoctorProfile = () => {
  const { user, token: authToken, dispatch } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialization: '',
    ticketPrice: '',
    qualifications: '',
    experiences: '',
    timeSlots: '',
    about: '',
    photo: null,
  });

  useEffect(() => {
    if(user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        specialization: user.specialization || '',
        ticketPrice: user.ticketPrice || '',
        qualifications: user.qualifications ? user.qualifications.join(', ') : '',
        experiences: user.experiences ? user.experiences.join(', ') : '',
        timeSlots: user.timeSlots ? user.timeSlots.join(', ') : '',
        about: user.about || '',
        photo: user.photo || null,
      });
      setPreviewURL(user.photo || '');
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    if(!file) return;

    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await doctorInstance.put(`/doctors/${user._id}`, formData);

      if (res.data.success) {
        toast.success(res.data.message);
        
        // Update the local context with new data
        dispatch({
          type: 'LOGIN',
          payload: {
            user: res.data.data,
            token: localStorage.getItem('token')
          }
        });

        // Update localStorage
        localStorage.setItem('userData', JSON.stringify(res.data.data));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-[24px] leading-9 font-bold text-headingColor mb-6">
        Profile Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="flex items-center gap-4">
          <figure className="w-[100px] h-[100px] rounded-full border-2 border-solid border-primaryColor overflow-hidden">
            <img 
              src={previewURL || user?.photo} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </figure>

          <div className="relative w-[130px] h-[50px]">
            <input
              type="file"
              name="photo"
              id="customFile"
              onChange={handleFileInputChange}
              accept=".jpg,.png"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
            <label
              htmlFor="customFile"
              className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer"
            >
              Upload Photo
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <label className="text-textColor font-semibold block mb-2">
              Full Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              placeholder="Full Name"
              required
            />
          </div>

          <div>
            <label className="text-textColor font-semibold block mb-2">
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              placeholder="Email"
              required
              disabled
            />
          </div>

          <div>
            <label className="text-textColor font-semibold block mb-2">
              Phone*
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              placeholder="Phone Number"
              required
            />
          </div>

          <div>
            <label className="text-textColor font-semibold block mb-2">
              Ticket Price*
            </label>
            <input
              type="number"
              name="ticketPrice"
              value={formData.ticketPrice}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              placeholder="Consultation Fee"
              required
            />
          </div>

          <div>
            <label className="text-textColor font-semibold block mb-2">
              Specialization*
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              placeholder="Specialization"
              required
            />
          </div>

          <div>
            <label className="text-textColor font-semibold block mb-2">
              Time Slots* (comma separated)
            </label>
            <input
              type="text"
              name="timeSlots"
              value={formData.timeSlots}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              placeholder="9:00 AM - 10:00 AM, 10:00 AM - 11:00 AM"
              required
            />
          </div>
        </div>

        {/* Qualifications & Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-textColor font-semibold block mb-2">
              Qualifications* (comma separated)
            </label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              placeholder="MBBS, MD"
              required
            />
          </div>

          <div>
            <label className="text-textColor font-semibold block mb-2">
              Experiences* (comma separated)
            </label>
            <input
              type="text"
              name="experiences"
              value={formData.experiences}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              placeholder="5 years at ABC Hospital"
              required
            />
          </div>
        </div>

        {/* Bio & About */}
        <div>
          <label className="text-textColor font-semibold block mb-2">
            Bio* (short)
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            maxLength={50}
            rows="2"
            className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
            placeholder="Write a short bio"
            required
          ></textarea>
        </div>

        <div>
          <label className="text-textColor font-semibold block mb-2">
            About* (detailed)
          </label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            rows="5"
            className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
            placeholder="Write detailed information about yourself"
            required
          ></textarea>
        </div>

        <div className="mt-7">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3 hover:bg-primaryColor/90 disabled:bg-primaryColor/75 disabled:cursor-not-allowed transition duration-300"
          >
            {loading ? <HashLoader size={25} color="#ffffff" /> : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile; 