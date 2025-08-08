import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaStar } from 'react-icons/fa';
import { BsArrowRight } from 'react-icons/bs';
import { BASE_URL } from "../config";
import useScrollToTop from "../hooks/useScrollToTop";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filterDoc, setFilterDoc] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(6);
  const navigate = useNavigate();
  
  // Use custom hook for scroll to top functionality
  const scrollToTop = useScrollToTop();
  
  // Get speciality from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const specFromUrl = params.get('specialization');
    if (specFromUrl) {
      setSelectedSpeciality(specFromUrl);
    }
  }, []);

  const normalizeSpecialization = (spec) => {
    if (!spec) return "";
    return spec;  // Return the speciality as is, since we're matching exact names
  };

  const specialities = [
    { name: "General physician", icon: "👨‍⚕️" },
    { name: "Gynecologist", icon: "👩‍⚕️" },
    { name: "Dermatologist", icon: "🔬" },
    { name: "Pediatricians", icon: "👶" },
    { name: "Neurologist", icon: "🧠" },
    { name: "Gastroenterologist", icon: "🩺" },
    { name: "Surgery", icon: "🔪" },
    { name: "Cardiology", icon: "❤️" },
    { name: "Orthopedic", icon: "🦴" },
    { name: "Dentist", icon: "🦷" }
  ];

  const handleShowAllDoctors = () => {
    setSelectedSpeciality("");
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/doctors`;
      
      // Add query parameters if they exist
      const params = new URLSearchParams();
      if (searchTerm) params.append('query', searchTerm);
      if (selectedSpeciality) {
        // Normalize the specialization before sending to API
        const normalizedSpec = normalizeSpecialization(selectedSpeciality);
        params.append('specialization', normalizedSpec);
      }
      params.append('isApproved', 'approved');
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('Fetching doctors from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        const allDoctors = result.data;
        setDoctors(allDoctors);
        setFilterDoc(allDoctors); // No need to filter here as backend handles it
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDoctors();
      setCurrentPage(1); // Reset to first page when search or filter changes
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSpeciality]);

  // Scroll to top when page changes
  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={fetchDoctors}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Doctor
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with the best healthcare professionals in Bangladesh
        </p>
      </div>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <div className="relative">
          <input
            type="search"
            className="w-full px-6 py-4 text-lg rounded-full border-2 border-blue-100 focus:border-blue-500 focus:outline-none shadow-lg pl-14"
            placeholder="Search by doctor name or speciality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Specialities Sidebar */}
          <div className="lg:w-1/4">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Specialities</h2>
            <div className="space-y-3">
              <button
                onClick={handleShowAllDoctors}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 ${
                  selectedSpeciality === ""
                    ? "bg-blue-500 text-white shadow-lg transform scale-105"
                    : "bg-white hover:bg-blue-50 text-gray-700 shadow"
                }`}
              >
                <span className="text-xl">👥</span>
                <span className="font-medium">All Doctors</span>
              </button>

              {specialities.map(({ name, icon }) => (
                <button
                  key={name}
                  onClick={() => setSelectedSpeciality(name)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 ${
                    selectedSpeciality === name
                      ? "bg-blue-500 text-white shadow-lg transform scale-105"
                      : "bg-white hover:bg-blue-50 text-gray-700 shadow"
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="font-medium">{name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="lg:w-3/4">
            <div className="flex flex-col">
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {filterDoc
                  .slice((currentPage - 1) * doctorsPerPage, currentPage * doctorsPerPage)
                  .map((doctor) => (
                    <div
                      key={doctor._id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                      onClick={() => navigate(`/doctors/${doctor._id}`)}
                    >
                      <div className="relative">
                        <img
                          src={doctor.photo}
                          alt={doctor.name}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          {/* Availability badge */}
                          <div className={`px-3 py-1 rounded-full text-sm text-white ${
                            doctor.isAvailable ? "bg-green-500" : "bg-red-500"
                          }`}>
                            {doctor.isAvailable ? "Available" : "Not Available"}
                          </div>
                          
                          {/* Approval status badge */}
                          <div className={`px-3 py-1 rounded-full text-sm text-white ${
                            doctor.isApproved === "approved" ? "bg-blue-500" : "bg-yellow-500"
                          }`}>
                            {doctor.isApproved === "approved" ? "Approved" : "Pending"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {doctor.name}
                        </h3>
                        <p className="text-blue-600 font-medium mb-4">
                          {doctor.specialization || "Specialization not specified"}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={`${i < doctor.averageRating ? "text-yellow-400" : "text-gray-300"}`} />
                          ))}
                          <span className="text-gray-600">({doctor.averageRating})</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <span className="font-semibold">{doctor.totalPatients || 0}</span>
                            <span>Patients Treated</span>
                          </span>
                          <button className="flex items-center gap-2 text-blue-500 hover:text-blue-700">
                            View Profile <BsArrowRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {filterDoc.length === 0 && (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                    No doctors found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}

              {/* Pagination Controls */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  Previous
                </button>
                <input
                  type="range"
                  min="1"
                  max={Math.max(1, Math.ceil(filterDoc.length / doctorsPerPage))}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-gray-600">
                  Page {currentPage} of {Math.max(1, Math.ceil(filterDoc.length / doctorsPerPage))}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filterDoc.length / doctorsPerPage)))}
                  disabled={currentPage === Math.ceil(filterDoc.length / doctorsPerPage)}
                  className={`px-4 py-2 rounded-lg ${currentPage === Math.ceil(filterDoc.length / doctorsPerPage) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Doctors;