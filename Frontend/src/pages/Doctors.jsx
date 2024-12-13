import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doctorsapn } from "../assets/data/doctorsapn";

const Doctors = () => {
  const { speciality } = useParams(); // Get speciality from URL
  const [filterDoc, setFilterDoc] = useState([]); // Initialize with empty array
  const [searchTerm, setSearchTerm] = useState(""); // For search input
  const navigate = useNavigate();

  const applyFilter = () => {
    if (speciality || searchTerm) {
      const filtered = doctorsapn.filter(
        (item) =>
          (!speciality || item.speciality.toLowerCase() === speciality.toLowerCase()) &&
          (!searchTerm ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.speciality.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilterDoc(filtered);
    } else {
      setFilterDoc(doctorsapn); // Show all doctors if no speciality or search term
    }
  };

  useEffect(() => {
    applyFilter();
  }, [speciality, searchTerm]); // Dependency on speciality and searchTerm


  return (
    <div className="p-9">

      {/* Search Bar */}
      <div className="container text-center">
        
        <div className="max-w-[570px] mt-[30px] mx-auto bg-[#0066ff2c] rounded-md flex items-center justify-between">
          <input
            type="search"
            className="py-4 pl-4 pr-2 bg-transparent w-full focus:outline-none cursor-pointer placeholder:text-textColor"
            placeholder="Search Doctor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <button
            onClick={applyFilter}
            className="btn mt-0 rounded-[0px] rounded-r-md bg-blue-500 text-white px-5 py-2 hover:bg-blue-600 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-lg font-semibold mb-4">
        Browse through the doctors specialists.
      </p>

      <div className="flex flex-col sm:flex-row items-start gap-8 mt-5">
        {/* Categories */}
        <div className="flex flex-col gap-6 text-sm text-gray-600 w-full sm:w-[20%] mt-5">
          {["Surgeon", "Neurologist", "Dermatologist", "Cardiologist", "Gastroenterologist"].map(
            (spec) => (
              <button
                key={spec}
                onClick={() => navigate(`/doctors/speciality/${spec}`)}
                className={`text-md px-5 py-3 text-center border border-gray-300 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md w-full 
              ${speciality === spec ? "bg-blue-500 text-white" : ""}`}
              >
                {spec}
              </button>
            )
          )}
        </div>

        {/* Doctors Grid */}
        <div
          className="w-full sm:w-[75%] grid gap-8 pt-5 gap-y-8"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {filterDoc.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden cursor-pointer hover:translate-y-[-5px] transition-transform duration-300"
              onClick={() => navigate(`/doctors/${item.id}`)} // Navigate on click
            >
              {/* Image */}
              <img
                className="w-full h-80 object-cover bg-blue-50"
                src={item.photo}
                alt={item.name}
              />
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-green-500 mb-3">
                  <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                  <p>Available</p>
                </div>
                <p className="text-gray-900 text-xl font-semibold mb-2">
                  {item.name}
                </p>
                <p className="text-gray-600 text-md">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
