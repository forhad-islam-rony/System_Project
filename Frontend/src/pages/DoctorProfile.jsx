/**
 * @fileoverview Doctor Profile Page Component
 * @description Displays and manages doctor profile information including
 * availability status, personal details, and profile management options
 * @author Healthcare System Team
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

// API base URL from environment variables
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Doctor Profile component for viewing and managing doctor information
 * @component
 * @returns {JSX.Element} Doctor profile page with details and controls
 * @description Provides doctor profile functionality including:
 * - Profile information display
 * - Availability status management
 * - Profile editing for own profile
 * - Responsive layout for all devices
 * - Real-time status updates
 */
const DoctorProfile = () => {
  // Router for navigation and query parameters
  const router = useRouter();
  
  // State Management
  const [doctor, setDoctor] = useState(null);      // Doctor profile data
  const [token, setToken] = useState(null);        // Authentication token
  const [isOwnProfile, setIsOwnProfile] = useState(false); // Profile ownership flag

  /**
   * Fetch doctor profile data on component mount
   * @effect
   * @description Loads doctor profile from API when component mounts or ID changes.
   * Also determines if the profile belongs to the logged-in doctor.
   */
  useEffect(() => {
    /**
     * Fetch doctor profile from backend
     * @async
     * @function fetchDoctor
     * @description Retrieves doctor data and sets up profile state
     */
    const fetchDoctor = async () => {
      // Make API request with authentication
      const res = await fetch(`${BASE_URL}/doctors/${router.query.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setDoctor(data.data);  // Update doctor profile state
        
        // Check if this is the logged-in doctor's own profile
        setIsOwnProfile(data.data._id === localStorage.getItem('userId'));
        
        // Store authentication token for later use
        setToken(localStorage.getItem('token'));
      }
    };

    fetchDoctor();  // Execute fetch on mount/update
  }, [router.query.id]);

  /**
   * Toggle doctor's availability status
   * @async
   * @function toggleAvailability
   * @description Updates doctor's availability status in backend and local state.
   * Shows success/error notifications for user feedback.
   */
  const toggleAvailability = async () => {
    try {
      // Make API request to toggle availability
      const res = await fetch(`${BASE_URL}/doctors/${doctor._id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isAvailable: !doctor.isAvailable  // Toggle current status
        })
      });

      const result = await res.json();

      // Handle API errors
      if (!res.ok) {
        throw new Error(result.message);
      }

      // Update local state with new availability
      setDoctor(prev => ({
        ...prev,
        isAvailable: !prev.isAvailable
      }));

      // Show success notification
      toast.success('Availability status updated successfully');
    } catch (err) {
      // Show error notification
      toast.error(err.message || 'Failed to update availability');
    }
  };

  /**
   * Render doctor profile interface
   * @returns {JSX.Element} Profile page with details and controls
   */
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Dr. {doctor?.name}
        </h1>
        <p className="text-gray-600 mb-2">{doctor?.specialization}</p>
        <p className="text-gray-600">{doctor?.hospital}</p>
      </div>

      {/* Availability Control (Only shown on own profile) */}
      {isOwnProfile && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Availability Status
          </h2>
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              doctor?.isAvailable 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {doctor?.isAvailable ? "Set as Unavailable" : "Set as Available"}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            {doctor?.isAvailable 
              ? "You are currently marked as available for appointments" 
              : "You are currently marked as unavailable for appointments"
            }
          </p>
        </div>
      )}

      {/* Profile Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Professional Details
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Specialization</h3>
            <p className="text-gray-600">{doctor?.specialization}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Experience</h3>
            <p className="text-gray-600">{doctor?.experience} years</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Education</h3>
            <p className="text-gray-600">{doctor?.education}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Contact</h3>
            <p className="text-gray-600">{doctor?.email}</p>
            <p className="text-gray-600">{doctor?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 