import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaAmbulance, FaPhone, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { MdEmergency } from 'react-icons/md';
import { createRequest, getUserRequests } from '../services/ambulanceService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map marker update component
const MarkerPosition = ({ position, onMarkerDrag }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          onMarkerDrag(position);
        },
      }}
    />
  ) : null;
};

const Ambulance = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickupLocation: '',
    emergencyType: '',
    preferredHospital: '',
    coordinates: null
  });

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapPosition, setMapPosition] = useState([23.8103, 90.4125]); // Default to Dhaka
  const [error, setError] = useState('');

  const emergencyTypes = [
    'Accident',
    'Heart Attack',
    'Stroke',
    'Respiratory Emergency',
    'Child Birth',
    'Other'
  ];

  const hospitals = [
    'Square Hospital',
    'Apollo Hospital',
    'United Hospital',
    'Ibn Sina Hospital',
    'Popular Hospital'
  ];

  const navigate = useNavigate();

  useEffect(() => {
    // Check for active requests immediately when component mounts
    const checkForActiveRequests = async () => {
      try {
        console.log('Checking for active ambulance requests...');
        const response = await getUserRequests();
        
        // Filter out requests that are not completed or cancelled
        const activeRequests = response.data.filter(request => 
          request.status !== 'completed' && request.status !== 'cancelled'
        );
        
        console.log(`Found ${activeRequests.length} active requests`);
        
        // If there's an active request, redirect to status page
        if (activeRequests.length > 0) {
          console.log('Active request found, redirecting to status page');
          navigate('/ambulance-status');
        }
      } catch (error) {
        console.error('Error checking for active requests:', error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
      }
    };
    
    checkForActiveRequests();
  }, [navigate]);

  const handleLocationSearch = async (query) => {
    setSearchQuery(query);
    setFormData(prev => ({ ...prev, pickupLocation: query }));

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('Failed to search location');
    }
  };

  const handleLocationSelect = (result) => {
    const newPosition = [parseFloat(result.lat), parseFloat(result.lon)];
    setMapPosition(newPosition);
    setFormData(prev => ({
      ...prev,
      pickupLocation: result.display_name,
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      }
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition([latitude, longitude]);
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              pickupLocation: data.display_name,
              coordinates: { latitude, longitude }
            }));
            toast.success('Location found successfully!');
          }
        } catch (error) {
          console.error('Error getting address:', error);
          toast.error('Failed to get address for your location');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enter it manually.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setMapPosition([lat, lng]);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setFormData(prev => ({
          ...prev,
          pickupLocation: data.display_name,
          coordinates: { latitude: lat, longitude: lng }
        }));
      }
    } catch (error) {
      console.error('Error getting address:', error);
      toast.error('Failed to get address for selected location');
    }
  };

  const handleMarkerDrag = async (newPosition) => {
    setMapPosition([newPosition.lat, newPosition.lng]);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.lat}&lon=${newPosition.lng}`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setFormData(prev => ({
          ...prev,
          pickupLocation: data.display_name,
          coordinates: { 
            latitude: newPosition.lat, 
            longitude: newPosition.lng 
          }
        }));
      }
    } catch (error) {
      console.error('Error getting address:', error);
      toast.error('Failed to get address for selected location');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.coordinates) {
      toast.error('Please select a location from the suggestions or use current location');
      return;
    }

    setLoading(true);
    try {
      const response = await createRequest(formData);
      toast.success('Ambulance request submitted successfully!');
      
      // Redirect to ambulance status page to track the request
      navigate('/ambulance-status');
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit request';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-[60px] pb-[60px] bg-[#f5f5f5]">
      <div className="container">
        <div className="xl:w-[470px] mx-auto mb-8">
          <h2 className="heading text-center">Emergency Ambulance Service</h2>
          <p className="text_para text-center">
            Request an ambulance for emergency medical assistance. We'll connect you with the nearest available ambulance.
          </p>
        </div>

        <div className="max-w-[1000px] mx-auto bg-white p-8 rounded-[20px] shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-headingColor font-semibold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                  required
                />
              </div>

              <div>
                <label className="block text-headingColor font-semibold mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaPhone className="text-gray-400" />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-headingColor font-semibold mb-2">Pickup Location</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaMapMarkerAlt />
                    )}
                    {locationLoading ? 'Getting Location...' : 'Use Current Location'}
                  </button>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleLocationSearch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                      placeholder="Search location..."
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleLocationSelect(result)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                          >
                            {result.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      readOnly
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                      placeholder="Selected location will appear here"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-headingColor font-semibold mb-2">Emergency Type</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <MdEmergency className="text-gray-400" />
                  </span>
                  <select
                    name="emergencyType"
                    value={formData.emergencyType}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                    required
                  >
                    <option value="">Select Emergency Type</option>
                    {emergencyTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-headingColor font-semibold mb-2">Preferred Hospital (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaAmbulance className="text-gray-400" />
                  </span>
                  <select
                    name="preferredHospital"
                    value={formData.preferredHospital}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                  >
                    <option value="">Select Hospital</option>
                    {hospitals.map((hospital, index) => (
                      <option key={index} value={hospital}>{hospital}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primaryColor text-white py-3 px-4 rounded-md hover:bg-primaryColor/90 transition duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaAmbulance className="text-xl" />
                    Request Ambulance
                  </>
                )}
              </button>
            </form>

            {/* Map Section */}
            <div className="h-[600px] bg-gray-100 rounded-lg overflow-hidden">
              <MapContainer
                center={mapPosition}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                onClick={handleMapClick}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MarkerPosition 
                  position={mapPosition} 
                  onMarkerDrag={handleMarkerDrag}
                />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ambulance; 