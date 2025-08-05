import React, { useState } from 'react';
import { FaSearch, FaTint, FaPhone, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import { BASE_URL } from '../config';
import HashLoader from 'react-spinners/HashLoader';
import { toast } from 'react-toastify';

const BloodGroup = () => {
  const [searchParams, setSearchParams] = useState({
    bloodGroup: '',
    district: '',
    location: ''
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const bangladeshDistricts = [
    'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogra', 'Brahmanbaria', 
    'Chandpur', 'Chapainawabganj', 'Chittagong', 'Chuadanga', 'Comilla', 'Cox\'s Bazar', 
    'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 
    'Habiganj', 'Jamalpur', 'Jessore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 
    'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 
    'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 
    'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 
    'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 
    'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 
    'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 
    'Tangail', 'Thakurgaon'
  ].sort();

  const searchDonors = async (params) => {
    if (!params.bloodGroup) {
      toast.error('Please select a blood group');
      return;
    }

    setLoading(true);
    try {
      const queryString = new URLSearchParams({
        bloodGroup: params.bloodGroup,
        district: params.district,
        location: params.location
      }).toString();

      const res = await fetch(`${BASE_URL}/auth/blood-donors?${queryString}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setDonors(result.data);
      if (result.data.length === 0) {
        toast.info('No donors found for the selected criteria');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchDonors(searchParams);
  };

  const handleCardClick = (bloodGroup) => {
    const newParams = { ...searchParams, bloodGroup };
    setSearchParams(newParams);
    searchDonors(newParams);
  };

  const handleReset = () => {
    setSearchParams({ bloodGroup: '', district: '', location: '' });
    setDonors([]);
  };

  return (
    <section className="pt-[60px] pb-[60px]">
      <div className="container">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primaryColor to-[#8d6aff] p-8 rounded-2xl mb-8">
          <div className="xl:w-[600px] mx-auto text-center text-white">
            <h1 className="text-[32px] md:text-[40px] font-bold mb-4">
              Find Blood Donors
            </h1>
            <p className="text-[16px] leading-7">
              Connect with willing blood donors in your area. Quick and easy search to find the right blood group in emergency situations.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-[800px] mx-auto bg-white rounded-2xl shadow-md p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-textColor font-semibold mb-2 block">
                  Blood Group
                </label>
                <select
                  value={searchParams.bloodGroup}
                  onChange={(e) => setSearchParams({...searchParams, bloodGroup: e.target.value})}
                  className="w-full px-4 py-3 border border-[#0066ff61] rounded-lg focus:outline-none focus:border-primaryColor"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-textColor font-semibold mb-2 block">
                  District
                </label>
                <div className="relative">
                  <select
                    value={searchParams.district}
                    onChange={(e) => setSearchParams({...searchParams, district: e.target.value})}
                    className="w-full px-4 py-3 border border-[#0066ff61] rounded-lg focus:outline-none focus:border-primaryColor appearance-none"
                  >
                    <option value="">Select District</option>
                    {bangladeshDistricts.map(district => (
                      <option 
                        key={district} 
                        value={district}
                        className="py-1"
                      >
                        {district}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-textColor font-semibold mb-2 block">
                  Specific Location
                </label>
                <input
                  type="text"
                  placeholder="Enter area/location"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                  className="w-full px-4 py-3 border border-[#0066ff61] rounded-lg focus:outline-none focus:border-primaryColor"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-primaryColor text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <HashLoader size={25} color="#ffffff" />
                ) : (
                  <>
                    <FaSearch />
                    Search Donors
                  </>
                )}
              </button>
              {(donors.length > 0 || loading) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Conditional Rendering for Results or Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <HashLoader size={50} color="#0067FF" />
          </div>
        ) : donors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => (
              <div key={donor._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    {donor.photo ? (
                      <img 
                        src={donor.photo} 
                        alt={donor.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <FaUser className="text-gray-400 text-2xl" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-headingColor">{donor.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                        {donor.bloodType}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {donor.gender}
                      </span>
                    </div>
                  </div>
                </div>
                {donor.phone && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <FaPhone className="text-primaryColor" />
                    <span>{donor.phone}</span>
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primaryColor" />
                    <span>{donor.district}</span>
                  </div>
                  {donor.location && (
                    <div className="mt-1 ml-6 text-gray-500">
                      {donor.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bloodGroups.map((group) => (
              <div 
                key={group} 
                className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleCardClick(group)}
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTint className="text-red-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-headingColor mb-2">{group}</h3>
                <p className="text-sm text-textColor">
                  Click to find {group} blood donors
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BloodGroup; 