import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';
import { useNavigate } from 'react-router-dom';

const SidePanel = ({ doctor }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visitType, setVisitType] = useState('first');
  const [price, setPrice] = useState(doctor.ticketPrice);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    problem: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkVisitType();
  }, [doctor._id]);

  const checkVisitType = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/bookings/check-visit-type/${doctor._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        setVisitType(data.visitType);
        if (data.visitType === 'second') {
          setPrice(doctor.ticketPrice * 0.75); // 25% discount
        } else if (data.visitType === 'free') {
          setPrice(0);
        }
      }
    } catch (err) {
      console.error('Error checking visit type:', err);
    }
  };

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow booking up to 30 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    
    const selectedDate = new Date(formData.appointmentDate);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    
    if (selectedDate < minDate) {
      toast.error('Please select a date at least 2 days in advance');
      return;
    }

    setShowModal(true);
  };

  const confirmBooking = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Check if doctor is still available
      if (!doctor.isAvailable) {
        toast.error('Sorry, this doctor is no longer available for appointments');
        setShowModal(false);
        setLoading(false);
        return;
      }

      const selectedDate = new Date(formData.appointmentDate);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 2);
      
      if (selectedDate < minDate) {
        toast.error('Please select a date at least 2 days in advance');
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/bookings/checkout-session/${doctor._id}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          doctor: doctor._id,
          visitType: visitType,
          price: price
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (data.success) {
        toast.success('Appointment request sent successfully');
        setShowModal(false);
        setFormData({
          appointmentDate: '',
          appointmentTime: '',
          problem: ''
        });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  // Modal Component
  const Modal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Appointment Information</h3>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Note: Appointments must be booked at least 2 days in advance.
          </p>
        </div>

        {visitType === 'first' && (
          <p className="mb-4">
            This will be registered as your first visit with Dr. {doctor.name}
          </p>
        )}
        {visitType === 'second' && (
          <p className="mb-4">
            As a returning patient of Dr. {doctor.name}, you're eligible for a 25% discount 
            on your appointment fee.
          </p>
        )}
        {visitType === 'free' && (
          <p className="mb-4">
            Your next visit with Dr. {doctor.name} will be free based on your previous appointment.
          </p>
        )}
        <ul className="mb-6 text-sm">
          <li className="mb-2">• Date: {formData.appointmentDate}</li>
          <li className="mb-2">• Time: {formData.appointmentTime}</li>
          <li className="mb-2">• Problem: {formData.problem}</li>
          <li className="mb-2">• Visit Type: {
            visitType === 'first' ? 'First Visit' :
            visitType === 'second' ? 'Second Visit (25% Off)' :
            'Free Visit'
          }</li>
          <li className="mb-2">• Price: ৳{price}</li>
        </ul>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmBooking}
            className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-blue-600"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="shadow-panelShadow p-3 lg:p-5 rounded-md">
        {/* Availability Status Banner */}
        <div className={`mb-4 p-3 rounded-lg text-center ${
          doctor.isAvailable 
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}>
          <p className="font-semibold">
            {doctor.isAvailable 
              ? "Doctor is Available for Appointments"
              : "Doctor is Currently Not Available"
            }
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text__para mt-0 font-semibold">
            Appointment Fee: 
          </p>
          <div className="text-right">
            <span className="text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold">
              ৳{price}
            </span>
            {visitType === 'second' && (
              <p className="text-sm text-green-600">25% discount applied (Return Patient)</p>
            )}
            {visitType === 'free' && (
              <p className="text-sm text-green-600">Free Visit</p>
            )}
          </div>
        </div>

        <div className="mt-[30px]">
          <p className="text__para mt-0 font-semibold text-headingColor">
            Available Time Slots:
          </p>
          <ul className="mt-3">
            {doctor.timeSlots && doctor.timeSlots.length > 0 ? (
              doctor.timeSlots.map((timeSlot, index) => (
                <li key={index} className="flex items-center justify-between mb-2">
                  <p className="text-[15px] leading-6 text-textColor font-semibold">
                    {timeSlot}
                  </p>
                  <p className="text-[15px] leading-6 text-textColor font-semibold text-green-500">
                    Available
                  </p>
                </li>
              ))
            ) : (
              <li className="text-[15px] leading-6 text-textColor">
                No time slots available
              </li>
            )}
          </ul>
        </div>

        {doctor.isAvailable ? (
          <form onSubmit={handleFormSubmit} className="mt-[30px]">
            <div className="mb-5">
              <label className="text-textColor font-semibold block mb-2">
                Select Date
                <span className="text-sm text-gray-500 ml-2">
                  (Minimum 2 days advance booking required)
                </span>
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                min={getTomorrowDate()}
                max={getMaxDate()}
                className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-md cursor-pointer"
                required
              />
            </div>

            <div className="mb-5">
              <select
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor rounded-md cursor-pointer"
                required
              >
                <option value="">Select Time</option>
                {doctor.timeSlots && doctor.timeSlots.length > 0 && 
                  doctor.timeSlots.map((timeSlot, index) => (
                    <option key={index} value={timeSlot}>
                      {timeSlot}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="mb-5">
              <textarea
                name="problem"
                value={formData.problem}
                onChange={handleInputChange}
                rows={3}
                placeholder="Write your health problem"
                className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-md cursor-pointer"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3 hover:bg-blue-600"
            >
              Book Appointment
            </button>
          </form>
        ) : (
          <div className="mt-[30px] p-4 bg-gray-50 rounded-lg">
            <p className="text-center text-gray-600">
              Sorry, this doctor is currently not available for appointments. 
              Please check back later or choose another doctor.
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <Modal>
          {/* Add availability check in modal */}
          {!doctor.isAvailable && (
            <div className="mb-4 p-3 bg-red-100 rounded-lg">
              <p className="text-sm text-red-800">
                This doctor is no longer available. Please choose another doctor.
              </p>
            </div>
          )}
          {/* ... rest of modal content ... */}
        </Modal>
      )}
    </div>
  );
};

export default SidePanel;