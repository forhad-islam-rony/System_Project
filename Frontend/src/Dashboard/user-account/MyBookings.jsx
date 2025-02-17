import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import Loading from '../../components/Loader/Loading';
import Error from '../../components/Error/Error';

const MyBookings = () => {
  const [currentBookings, setCurrentBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    fetchBookings();
  }, []);

  const sortAppointments = (appointments) => {
    return appointments.sort((a, b) => {
      // Sort by date in descending order
      const dateComparison = new Date(b.appointmentDate) - new Date(a.appointmentDate);
      // If dates are same, sort by time
      if (dateComparison === 0) {
        return b.appointmentTime.localeCompare(a.appointmentTime);
      }
      return dateComparison;
    });
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch current bookings
      const bookingsRes = await fetch(`${BASE_URL}/users/appointments/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Fetch booking history
      const historyRes = await fetch(`${BASE_URL}/users/appointments/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const bookingsData = await bookingsRes.json();
      const historyData = await historyRes.json();

      if (!bookingsRes.ok || !historyRes.ok) {
        throw new Error(bookingsData.message || historyData.message);
      }

      // Sort the bookings before setting state
      setCurrentBookings(sortAppointments(bookingsData.data));
      setBookingHistory(sortAppointments(historyData.data));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <Loading />;
  if (error) return <Error errorMessage={error} />;

  const displayAppointments = activeTab === 'current' ? currentBookings : bookingHistory;

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-headingColor">My Appointments</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-5 rounded-lg ${
              activeTab === 'current'
                ? 'bg-primaryColor text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-5 rounded-lg ${
              activeTab === 'history'
                ? 'bg-primaryColor text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {displayAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
          <img
            src="/empty-box.png"
            alt="No appointments"
            className="w-32 h-32 mb-4 opacity-50"
          />
          <p className="text-lg">
            No {activeTab === 'current' ? 'current appointments' : 'appointment history'} found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {displayAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white p-4 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={appointment.doctor.photo || '/doctor-placeholder.png'}
                    alt="doctor"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Dr. {appointment.doctor.name}
                    </h3>
                    <p className="text-gray-500">
                      {appointment.doctor.specialization}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {formatDate(appointment.appointmentDate)}
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {appointment.appointmentTime}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Visit Type</p>
                  <p className="font-medium capitalize">
                    {appointment.visitType} Visit
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fee</p>
                  <p className="font-medium">
                    ${appointment.fee}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Medical Concern</p>
                <p className="text-gray-700">{appointment.problem}</p>
              </div>

              {activeTab === 'current' && appointment.status === 'approved' && (
                <div className="mt-4 bg-green-50 p-3 rounded-lg">
                  <p className="text-green-700 text-sm flex items-center">
                    <span className="mr-2">✓</span>
                    Appointment confirmed for {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;