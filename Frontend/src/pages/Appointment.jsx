import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/doctors/appointments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setAppointments(data.data);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/doctors/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Appointment status updated successfully');
        fetchAppointments(); // Refresh the list
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateVisitType = async (appointmentId, visitType) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/doctors/appointments/${appointmentId}/visit-type`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ visitType })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Visit type updated successfully');
        fetchAppointments(); // Refresh the list
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Manage Appointments</h2>
      <div className="grid gap-6">
        {appointments.map((appointment) => (
          <div key={appointment._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{appointment.name}</h3>
                <p className="text-gray-600">Email: {appointment.email}</p>
                <p className="text-gray-600">Phone: {appointment.phone}</p>
                <p className="text-gray-600">
                  Date: {new Date(appointment.appointmentDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600">Time: {appointment.appointmentTime}</p>
                <p className="text-gray-600">Problem: {appointment.problem}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Status
                  </label>
                  <select
                    value={appointment.status}
                    onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit Type
                  </label>
                  <select
                    value={appointment.visitType}
                    onChange={(e) => updateVisitType(appointment._id, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="first">First Visit (Full Price)</option>
                    <option value="second">Second Visit (25% Off)</option>
                    <option value="free">Free Visit</option>
                  </select>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium">Payment Status: 
                    <span className={`ml-2 ${appointment.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                      {appointment.isPaid ? 'Paid' : 'Not Paid'}
                    </span>
                  </p>
                  <p className="font-medium">Current Price: 
                    <span className="ml-2">
                      ${appointment.ticketPrice}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-center text-gray-500">No appointments found</p>
        )}
      </div>
    </div>
  );
};

export default Appointment;