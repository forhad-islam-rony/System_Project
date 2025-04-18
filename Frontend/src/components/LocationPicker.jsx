import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return <Marker 
    position={position} 
    draggable={true}
    eventHandlers={{
      dragend: (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        setPosition([position.lat, position.lng]);
      },
    }}
  />;
}

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          reverseGeocode(latitude, longitude);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location if geolocation fails
          setPosition([23.8103, 90.4125]); // Default to Dhaka, Bangladesh
          setLoading(false);
        }
      );
    }
  }, []);

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      setAddress(data.display_name);
      onLocationSelect({
        coordinates: [lat, lon],
        address: data.display_name
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleMarkerPositionChange = async (newPosition) => {
    setPosition(newPosition);
    await reverseGeocode(newPosition[0], newPosition[1]);
  };

  const handleSearchAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        reverseGeocode(parseFloat(lat), parseFloat(lon));
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  if (loading || !position) {
    return <div className="flex justify-center items-center h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchAddress} className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Search location or drag marker"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
        />
        <button
          type="submit"
          className="bg-primaryColor text-white px-4 py-2 rounded-md hover:bg-primaryColor/90"
        >
          Search
        </button>
      </form>

      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handleMarkerPositionChange} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPicker; 