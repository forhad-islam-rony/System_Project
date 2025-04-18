import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaMapMarkerAlt, FaSpinner, FaSearch } from 'react-icons/fa';
import { createRequest } from '../services/ambulanceService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ position, setPosition, onLocationSelect }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setPosition(newPos);
            onLocationSelect(newPos.lat, newPos.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const Ambulance = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        pickupLocation: '',
        emergencyType: '',
        preferredHospital: ''
    });
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);
    const mapRef = useRef(null);
    const navigate = useNavigate();

    const emergencyTypes = [
        { value: 'accident', label: 'Accident' },
        { value: 'heart_attack', label: 'Heart Attack' },
        { value: 'stroke', label: 'Stroke' },
        { value: 'pregnancy', label: 'Pregnancy Emergency' },
        { value: 'burn', label: 'Burn Injury' },
        { value: 'other', label: 'Other' }
    ];

    const hospitals = [
        'Square Hospital',
        'Apollo Hospital',
        'United Hospital',
        'Ibn Sina Hospital',
        'Popular Hospital'
    ];

    const reverseGeocode = useCallback(async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data.display_name) {
                setFormData(prev => ({
                    ...prev,
                    pickupLocation: data.display_name
                }));
            }
        } catch (error) {
            console.error('Error getting address:', error);
            toast.error('Failed to get address for selected location');
        }
    }, []);

    const handleLocationSearch = (e) => {
        const query = e.target.value;
        setFormData(prev => ({ ...prev, pickupLocation: query }));

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        // Set new timeout
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
                );
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error('Error searching location:', error);
                toast.error('Failed to search location');
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    const handleLocationSelect = (result) => {
        const newPosition = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
        };
        setPosition(newPosition);
        setFormData(prev => ({
            ...prev,
            pickupLocation: result.display_name
        }));
        setSearchResults([]);
    };

    const handleMapLocationSelect = async (lat, lng) => {
        await reverseGeocode(lat, lng);
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
                try {
                    const { latitude, longitude } = position.coords;
                    const newPosition = { lat: latitude, lng: longitude };
                    setPosition(newPosition);
                    await reverseGeocode(latitude, longitude);
                } catch (error) {
                    toast.error('Failed to get your location details');
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
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!position) {
            toast.error('Please select a pickup location on the map');
            return;
        }

        setLoading(true);
        try {
            const response = await createRequest({
                ...formData,
                coordinates: {
                    latitude: position.lat,
                    longitude: position.lng
                }
            });
            
            toast.success('Ambulance request submitted successfully!');
            
            // Redirect to the ambulance status page
            navigate('/ambulance-status');
            
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit request';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-primaryColor">Request Ambulance</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Emergency Type</label>
                            <select
                                name="emergencyType"
                                value={formData.emergencyType}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            >
                                <option value="">Select emergency type</option>
                                {emergencyTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Preferred Hospital</label>
                            <select
                                name="preferredHospital"
                                value={formData.preferredHospital}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
                            >
                                <option value="">Select hospital (optional)</option>
                                {hospitals.map(hospital => (
                                    <option key={hospital} value={hospital}>
                                        {hospital}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                            <div className="mt-1 space-y-2">
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    className="w-full flex items-center justify-center gap-2 bg-primaryColor text-white py-2 px-4 rounded-md hover:bg-primaryColor/90"
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
                                        name="pickupLocation"
                                        value={formData.pickupLocation}
                                        onChange={handleLocationSearch}
                                        placeholder="Search location or click on map"
                                        required
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor pr-10"
                                    />
                                    {isSearching && (
                                        <FaSpinner className="animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    )}
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
                                </div>
                            </div>
                        </div>

                        {/* Map Container */}
                        <div className="h-[300px] bg-gray-100 rounded-lg overflow-hidden">
                            <MapContainer
                                center={[23.8103, 90.4125]} // Default to Dhaka
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                ref={mapRef}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <MapComponent 
                                    position={position} 
                                    setPosition={setPosition}
                                    onLocationSelect={handleMapLocationSelect}
                                />
                            </MapContainer>
                        </div>
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
                        'Request Ambulance'
                    )}
                </button>
            </form>
        </div>
    );
};

export default Ambulance; 