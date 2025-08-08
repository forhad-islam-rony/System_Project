/**
 * @fileoverview Pharmacy page component for medicine browsing and purchasing
 * @description React component that displays medicines with search, filter, and cart functionality.
 * Includes favorites management, category filtering, and integration with cart system.
 * @author Healthcare System Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { BsSearch, BsCart3 } from 'react-icons/bs';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import HashLoader from 'react-spinners/HashLoader';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

/**
 * Pharmacy component for displaying and managing medicines
 * @component
 * @returns {JSX.Element} Pharmacy page with medicine grid, search, and filters
 * @description Provides a comprehensive pharmacy interface with:
 * - Medicine search and filtering by category
 * - Add to cart functionality
 * - Favorites/wishlist management
 * - Responsive grid layout
 * - Loading states and error handling
 */
const Pharmacy = () => {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState(''); // Current search query
  
  // State for medicine data management
  const [medicines, setMedicines] = useState([]); // All medicines from API
  const [filterMed, setFilterMed] = useState([]); // Filtered medicines for display
  
  // State for filtering and categorization
  const [category, setCategory] = useState('all'); // Current selected category
  const [categories, setCategories] = useState(['all']); // Available categories
  
  // State for user interactions
  const [favorites, setFavorites] = useState([]); // User's favorite medicines
  
  // State for UI loading and error handling
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(null); // Error state for failed operations
  
  // Context hooks for cart and authentication
  const { addToCart } = useCart(); // Cart functionality from context
  const { user } = useAuth(); // User authentication state

  /**
   * Fetch medicines from backend API
   * @async
   * @function fetchMedicines
   * @description Retrieves all available medicines from the backend,
   * extracts unique categories, and sets up initial state
   */
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

        // Define predefined categories to ensure consistency
        const predefinedCategories = [
          'all',
          'Antibiotics',
          'Cardiac', 
          'Painkillers',
          'Vitamins & Supplements',
          'Diabetes',
          'Respiratory',
          'Digestive'
        ];

        // Extract unique categories from medicines and normalize them
        const normalizeCategory = (cat) => {
          if (!cat) return 'Other';
          const lowerCat = cat.toLowerCase();
          
          // Map variations to standard categories
          if (lowerCat.includes('vitamin') || lowerCat.includes('supplement')) {
            return 'Vitamins & Supplements';
          }
          if (lowerCat.includes('antibiotic')) {
            return 'Antibiotics';
          }
          if (lowerCat.includes('heart') || lowerCat.includes('cardiac')) {
            return 'Cardiac';
          }
          if (lowerCat.includes('pain') || lowerCat.includes('killer')) {
            return 'Painkillers';
          }
          if (lowerCat.includes('diabete') || lowerCat.includes('sugar')) {
            return 'Diabetes';
          }
          if (lowerCat.includes('respir') || lowerCat.includes('lung') || lowerCat.includes('cough')) {
            return 'Respiratory';
          }
          if (lowerCat.includes('digest') || lowerCat.includes('stomach') || lowerCat.includes('gastro')) {
            return 'Digestive';
          }
          
          return cat; // Return original if no match
        };

        // Get categories that actually exist in the data
        const existingCategories = [...new Set(data.data.map(med => normalizeCategory(med.category)))];
        
        // Combine predefined categories with any new ones from data
        const allCategories = ['all', ...predefinedCategories.slice(1), ...existingCategories.filter(cat => !predefinedCategories.includes(cat))];
        
        setCategories([...new Set(allCategories)]); // Remove duplicates
      } catch (err) {
        console.error('Detailed error:', err); // More detailed error logging
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  // Function to normalize item categories (same logic as in fetchMedicines)
  const normalizeItemCategory = (cat) => {
    if (!cat) return 'Other';
    const lowerCat = cat.toLowerCase();
    
    if (lowerCat.includes('vitamin') || lowerCat.includes('supplement')) {
      return 'Vitamins & Supplements';
    }
    if (lowerCat.includes('antibiotic')) {
      return 'Antibiotics';
    }
    if (lowerCat.includes('heart') || lowerCat.includes('cardiac')) {
      return 'Cardiac';
    }
    if (lowerCat.includes('pain') || lowerCat.includes('killer')) {
      return 'Painkillers';
    }
    if (lowerCat.includes('diabete') || lowerCat.includes('sugar')) {
      return 'Diabetes';
    }
    if (lowerCat.includes('respir') || lowerCat.includes('lung') || lowerCat.includes('cough')) {
      return 'Respiratory';
    }
    if (lowerCat.includes('digest') || lowerCat.includes('stomach') || lowerCat.includes('gastro')) {
      return 'Digestive';
    }
    
    return cat;
  };

  const applyFilter = (category, searchTerm) => {
    let filtered = medicines;
    
    if (category !== 'all') {
      filtered = filtered.filter(item => {
        const normalizedItemCategory = normalizeItemCategory(item.category);
        return normalizedItemCategory === category;
      });
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
                        <span className="text-2xl font-bold text-blue-600">৳{item.price}</span>
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