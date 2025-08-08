import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import uploadImageToCloudinary from '../../utils/uploadCloudinary';
import { BASE_URL, token } from '../../config';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';
import { doctorInstance } from '../../utils/axiosConfig';

// Add this at the top of your file, outside the component
const SPECIALIZATIONS = [
  'General physician',
  'Gynecologist',
  'Dermatologist',
  'Pediatricians',
  'Neurologist',
  'Gastroenterologist',
  'Surgery',
  'Cardiology',
  'Orthopedic',
  'Dentist'
];

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM"
];

const DoctorProfile = ({ onProfileUpdate }) => {
  const { user, token: authToken, dispatch } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

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
      setSelectedTimeSlots(user.timeSlots || []);
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

    try {
      setLoading(true);
      // Upload to Cloudinary
      const data = await uploadImageToCloudinary(file);
      
      // Update form data with the Cloudinary URL
      setFormData(prev => ({
        ...prev,
        photo: data.url
      }));
      
      setPreviewURL(data.url);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Error uploading image');
      console.error('Upload error:', error);
    }
  };

  const handleTimeSlotChange = (e) => {
    const value = e.target.value;
    let updatedSlots;
    
    if (selectedTimeSlots.includes(value)) {
      updatedSlots = selectedTimeSlots.filter(slot => slot !== value);
    } else {
      updatedSlots = [...selectedTimeSlots, value];
    }
    
    updatedSlots.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.split(' - ')[0]}`);
      const timeB = new Date(`2000/01/01 ${b.split(' - ')[0]}`);
      return timeA - timeB;
    });

    setSelectedTimeSlots(updatedSlots);
    setFormData(prev => ({
      ...prev,
      timeSlots: updatedSlots.join(', ')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedData = {
        ...formData,
        qualifications: formData.qualifications.split(',').map(item => item.trim()),
        experiences: formData.experiences.split(',').map(item => item.trim()),
        timeSlots: selectedTimeSlots
      };

      const res = await doctorInstance.put(`/doctors/${user._id}`, updatedData);

      if (res.data.success) {
        toast.success(res.data.message);
        
        // Update the local context with new data
        dispatch({
          type: 'UPDATE_USER',
          payload: {
            user: res.data.data,
            token: localStorage.getItem('token')
          }
        });

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(res.data.data));
        
        // Trigger parent component refresh if callback is provided
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      console.error('Update error:', error);
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
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              required
            >
              <option value="">Select Specialization</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-textColor font-semibold block mb-2">
              Time Slots*
            </label>
            <div className="relative">
              <div 
                className="w-full px-4 py-3 border border-solid border-[#0066ff61] rounded-lg cursor-pointer flex justify-between items-center"
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              >
                <span className={`${selectedTimeSlots.length === 0 ? 'text-textColor' : 'text-headingColor'}`}>
                  {selectedTimeSlots.length === 0 
                    ? 'Select time slots' 
                    : `${selectedTimeSlots.length} slots selected`}
                </span>
                <svg 
                  className={`w-5 h-5 transition-transform ${isTimeDropdownOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              {isTimeDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-[#0066ff61] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {TIME_SLOTS.map((slot) => (
                    <label 
                      key={slot}
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#0066ff0a] cursor-pointer"
                    >
                      <span className="text-[15px] leading-6 text-headingColor">
                        {slot}
                      </span>
                      <input
                        type="checkbox"
                        value={slot}
                        checked={selectedTimeSlots.includes(slot)}
                        onChange={handleTimeSlotChange}
                        className="w-4 h-4 text-primaryColor rounded border-gray-300 focus:ring-primaryColor"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </label>
                  ))}
                </div>
              )}

              {selectedTimeSlots.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Please select at least one time slot
                </p>
              )}

              {/* Selected Slots Preview */}
              {selectedTimeSlots.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTimeSlots.map((slot) => (
                    <span 
                      key={slot}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#0066ff1a] text-primaryColor"
                    >
                      {slot}
                      <button
                        type="button"
                        onClick={() => handleTimeSlotChange({ target: { value: slot } })}
                        className="ml-2 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
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