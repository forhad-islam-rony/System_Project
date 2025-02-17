import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const DoctorProfile = () => {
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      const res = await fetch(`${BASE_URL}/doctors/${router.query.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setDoctor(data.data);
        setIsOwnProfile(data.data._id === localStorage.getItem('userId'));
        setToken(localStorage.getItem('token'));
      }
    };

    fetchDoctor();
  }, [router.query.id]);

  const toggleAvailability = async () => {
    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctor._id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isAvailable: !doctor.isAvailable
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      // Update local state
      setDoctor(prev => ({
        ...prev,
        isAvailable: !prev.isAvailable
      }));

      toast.success('Availability status updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update availability');
    }
  };

  return (
    <div>
      {/* ... existing JSX ... */}
      {isOwnProfile && (
        <div className="mt-4">
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-lg text-white ${
              doctor.isAvailable 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {doctor.isAvailable ? "Set as Unavailable" : "Set as Available"}
          </button>
        </div>
      )}
      {/* ... rest of the JSX ... */}
    </div>
  );
};

export default DoctorProfile; 