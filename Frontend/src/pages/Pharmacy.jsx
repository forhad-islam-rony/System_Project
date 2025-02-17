import React, { useState, useEffect } from 'react';
import { BsSearch, BsCart3 } from 'react-icons/bs';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import HashLoader from 'react-spinners/HashLoader';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Pharmacy = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [filterMed, setFilterMed] = useState([]);
  const [category, setCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['all']);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Fetch medicines from backend
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/medicines`);
        
        console.log('Response status:', response.status); // Debug log
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch medicines');
        }
        
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log
        
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid data format received from server');
        }

        setMedicines(data.data);
        setFilterMed(data.data);

        // Extract unique categories from medicines
        const uniqueCategories = ['all', ...new Set(data.data.map(med => med.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Detailed error:', err); // More detailed error logging
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const applyFilter = (category, searchTerm) => {
    let filtered = medicines;
    
    if (category !== 'all') {
      filtered = filtered.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilterMed(filtered);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilter(category, term);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    applyFilter(cat, searchTerm);
  };

  const toggleFavorite = (medicineId) => {
    setFavorites(prev => 
      prev.includes(medicineId) 
        ? prev.filter(id => id !== medicineId)
        : [...prev, medicineId]
    );
  };

  const handleAddToCart = async (e, medicine) => {
    e.stopPropagation(); // Prevent navigation when clicking add to cart
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-8 mb-8">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Online Pharmacy</h1>
          <p className="text-lg mb-6">Your trusted source for quality medicines and healthcare products</p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="search"
              className="w-full py-3 pl-12 pr-4 text-gray-700 bg-white rounded-full focus:outline-none focus:shadow-outline"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`w-full px-4 py-2 rounded-lg transition-all text-left capitalize
                    ${category === cat 
                      ? "bg-blue-500 text-white" 
                      : "hover:bg-gray-100"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="md:w-3/4">
          {filterMed.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No medicines found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterMed.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative cursor-pointer">
                    <img
                      className="w-full h-48 object-cover"
                      src={item.photo}
                      alt={item.productName}
                      onClick={() => navigate(`/pharmacy/${item._id}`)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item._id);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all"
                    >
                      {favorites.includes(item._id) 
                        ? <FaHeart className="text-red-500" />
                        : <FaRegHeart className="text-gray-400" />
                      }
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{item.productName}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{item.description.text}</p>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">${item.price}</span>
                        {item.dosageMg && (
                          <span className="text-sm text-gray-500 block">
                            {item.dosageMg}mg
                          </span>
                        )}
                      </div>
                      <button 
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                        onClick={(e) => handleAddToCart(e, item)}
                      >
                        <BsCart3 />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pharmacy; 