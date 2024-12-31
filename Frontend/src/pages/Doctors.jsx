import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doctorsapn } from "../assets/data/doctorsapn";
import { FaSearch, FaStar } from 'react-icons/fa';
import { BsArrowRight } from 'react-icons/bs';

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState(speciality || "");
  const navigate = useNavigate();

  const specialities = [
    { name: "Surgeon", icon: "🔪" },
    { name: "Neurologist", icon: "🧠" },
    { name: "Dermatologist", icon: "👨‍⚕️" },
    { name: "Cardiologist", icon: "❤️" },
    { name: "Gastroenterologist", icon: "🩺" }
  ];

  const applyFilter = () => {
    let filtered = doctorsapn;
    
    if (selectedSpeciality) {
      filtered = filtered.filter(
        doc => doc.speciality.toLowerCase() === selectedSpeciality.toLowerCase()
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(
        doc =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.speciality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [selectedSpeciality, searchTerm]);

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
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filterDoc.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                >
                  <div className="relative">
                    <img
                      src={doctor.photo}
                      alt={doctor.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      Available
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-4">
                      {doctor.speciality}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" />
                      ))}
                      <span className="text-gray-600">({doctor.avgRating})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {doctor.totalPatients}+ Patients
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
