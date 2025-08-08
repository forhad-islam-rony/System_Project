import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { Toaster, toast } from 'react-hot-toast';

const Appointments = ({ doctorData }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [newAppointmentsCount, setNewAppointmentsCount] = useState(0);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/doctor-appointments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }
      
      const data = await res.json();

      if (data.success) {
        setAppointments(data.data);
        setNewAppointmentsCount(data.newAppointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateVisitType = async (bookingId, visitType) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/${bookingId}/visit-type`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ visitType })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update visit type');
      }

      const data = await res.json();

      if (data.success) {
        toast.success('Visit type updated successfully');
        fetchAppointments();
      }
    } catch (err) {
      console.error('Error updating visit type:', err);
      toast.error(err.message);
    }
  };

  const updateAppointmentStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const data = await res.json();

      if (data.success) {
        toast.success('Appointment status updated successfully');
        fetchAppointments();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.message);
    }
  };

  const searchPatients = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/search-patients?email=${searchEmail}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (err) {
      toast.error('Error searching patients');
    }
  };

  const updatePatientVisitType = async (email, visitType) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/update-patient-visit-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email, visitType })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update visit type');
      }

      if (data.success) {
        toast.success(`Visit type updated to ${visitType}`);
        setShowSearchModal(false);
        fetchAppointments();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Error updating patient visit type');
    }
  };

  const markAsViewed = async (appointmentId) => {
    try {
      await fetch(`${BASE_URL}/bookings/${appointmentId}/mark-viewed`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (err) {
      console.error('Error marking appointment as viewed:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'finished': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="p-4 h-screen flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Patient Appointments</h2>
            {newAppointmentsCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                {newAppointmentsCount} new
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSearchModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search Patient
          </button>
      </div>

        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Search Patient by Email</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter patient email"
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={searchPatients}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Search
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {searchResults ? (
                  <div className="border p-4 rounded-lg bg-white">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="font-semibold">Name:</p>
                        <p>{searchResults.name}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Email:</p>
                        <p>{searchResults.email}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Phone:</p>
                        <p>{searchResults.phone}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Total Visits:</p>
                        <p>{searchResults.totalVisits}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Last Visit Type:</p>
                        <p>{searchResults.lastVisitType}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Current Price:</p>
                        <p>${searchResults.currentPrice}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="font-semibold mb-2">Update Next Visit Type:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => updatePatientVisitType(searchResults.email, 'first')}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          title="Reset to default first visit price"
                        >
                          Default Visit
                        </button>
                        <button
                          onClick={() => updatePatientVisitType(searchResults.email, 'second')}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          title="Apply 25% discount"
                        >
                          Second Visit
                        </button>
                        <button
                          onClick={() => updatePatientVisitType(searchResults.email, 'free')}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Free Visit
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>• Default Visit: Full price</p>
                        <p>• Second Visit: 25% discount</p>
                        <p>• Free Visit: No charge</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    No patient found with this email
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowSearchModal(false)}
                className="mt-4 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment._id} 
                className={`border p-4 rounded-lg bg-white shadow-sm ${
                  appointment.isNewForDoctor ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onMouseEnter={() => {
                  if (appointment.isNewForDoctor) {
                    markAsViewed(appointment._id);
                  }
                }}
              >
                {appointment.isNewForDoctor && (
                  <div className="text-blue-500 text-sm mb-2">New Appointment!</div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{appointment.name}</h3>
                    <p className="text-gray-600">Email: {appointment.email}</p>
                    <p className="text-gray-600">Phone: {appointment.phone}</p>
                    <p className="text-gray-600">Date: {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                    <p className="text-gray-600">Time: {appointment.appointmentTime}</p>
                    <p className="text-gray-600">Problem: {appointment.problem}</p>
                    <div className={`inline-block px-2 py-1 rounded mt-2 ${getStatusColor(appointment.status)}`}>
                      Status: {appointment.status}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, 'approved')}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                    )}

                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {appointment.status === 'approved' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to mark this appointment as finished? This will remove it from the list.')) {
                            updateAppointmentStatus(appointment._id, 'finished');
                          }
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Mark as Finished
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <p className="text-center text-gray-500">No appointments found</p>
            )}
          </div>
        </div>
    </div>
    </>
  );
};

export default Appointments; 