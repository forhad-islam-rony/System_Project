import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicines } from '../assets/data/medicines';
import { BsCart3 } from 'react-icons/bs';

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  
  const medicine = medicines.find(med => med.id === id);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  if (!medicine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Medicine not found</h2>
          <button 
            onClick={() => navigate('/pharmacy')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Pharmacy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image Section with Zoom Effect */}
            <div className="md:w-1/2 relative">
              <div
                className="relative w-full h-[500px] overflow-hidden cursor-zoom-in"
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
              >
                <img 
                  src={medicine.image} 
                  alt={medicine.name} 
                  className="w-full h-full object-cover"
                  style={{
                    transform: showZoom ? 'scale(2)' : 'scale(1)',
                    transformOrigin: `${position.x}% ${position.y}%`,
                    transition: showZoom ? 'none' : 'transform 0.3s ease-out'
                  }}
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{medicine.name}</h1>
                <p className="text-gray-600 text-lg mb-2">Generic Name: {medicine.genericName}</p>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {medicine.category}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-blue-600 mb-2">${medicine.price}</p>
                <p className="text-gray-500">{medicine.dosage}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{medicine.detailedDescription}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Usage</h2>
                <p className="text-gray-700">{medicine.usage}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Side Effects</h2>
                <p className="text-gray-700">{medicine.sideEffects}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Storage</h2>
                <p className="text-gray-700">{medicine.storage}</p>
              </div>

              <button 
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors"
                onClick={() => alert(`${medicine.name} added to cart!`)}
              >
                <BsCart3 size={20} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails; 