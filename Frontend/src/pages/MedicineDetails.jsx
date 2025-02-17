import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsCart3 } from 'react-icons/bs';
import { BASE_URL } from '../config';
import HashLoader from 'react-spinners/HashLoader';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/medicines/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch medicine details');
        }

        const data = await response.json();
        setMedicine(data.data);
      } catch (err) {
        console.error('Error fetching medicine details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineDetails();
  }, [id]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    await addToCart(medicine._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#3498db" />
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {error || 'Medicine not found'}
          </h2>
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
                  src={medicine.photo} 
                  alt={medicine.productName} 
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{medicine.productName}</h1>
                <p className="text-gray-600 text-lg mb-2">Generic Name: {medicine.genericName}</p>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {medicine.category}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-blue-600 mb-2">${medicine.price}</p>
                <p className="text-gray-500">{medicine.dosageMg}mg</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{medicine.description.text}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Key Benefits</h2>
                <p className="text-gray-700">{medicine.description.keyBenefits}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Recommended For</h2>
                <p className="text-gray-700">{medicine.description.recommendedFor}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Usage Instructions</h2>
                <p className="text-gray-700">{medicine.usageInstruction}</p>
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
                onClick={handleAddToCart}
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