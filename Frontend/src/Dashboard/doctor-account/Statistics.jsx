import React, { useMemo } from 'react';
import { FaUserMd, FaCalendarCheck, FaStar, FaChartLine, FaClock, FaCheckCircle } from 'react-icons/fa';

const Statistics = ({ doctorData }) => {
  // Calculate statistics from the doctor data
  const stats = useMemo(() => {
    if (!doctorData) return null;

    const appointments = doctorData.appointments || [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Total appointments
    const totalAppointments = appointments.length;

    // Today's appointments
    const todaysAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      return aptDate === todayStr;
    }).length;

    // Pending appointments
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

    // Completed appointments
    const completedAppointments = appointments.filter(apt => apt.status === 'finished' || apt.status === 'approved').length;

    // Unique patients count
    const uniquePatients = new Set(appointments.map(apt => apt.user)).size;

    // Calculate average rating
    const averageRating = doctorData.averageRating || 0;
    const totalRating = doctorData.totalRating || 0;

    return {
      totalAppointments,
      todaysAppointments,
      pendingAppointments,
      completedAppointments,
      uniquePatients,
      averageRating,
      totalRating
    };
  }, [doctorData]);

  if (!stats) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded mb-6 w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[24px] leading-9 font-bold text-headingColor mb-6">
        Dashboard Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Total Appointments */}
        <div className="p-6 bg-[#CCF0F3] rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[16px] leading-7 font-semibold text-textColor mb-1">
                Total Appointments
              </h4>
              <span className="text-[28px] leading-9 font-bold text-irisBlueColor">
                {stats.totalAppointments}
              </span>
            </div>
            <FaCalendarCheck className="text-4xl text-irisBlueColor opacity-80" />
          </div>
        </div>

        {/* Unique Patients */}
        <div className="p-6 bg-[#FFF9EA] rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[16px] leading-7 font-semibold text-textColor mb-1">
                Total Patients
              </h4>
              <span className="text-[28px] leading-9 font-bold text-yellowColor">
                {stats.uniquePatients}
              </span>
            </div>
            <FaUserMd className="text-4xl text-yellowColor opacity-80" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="p-6 bg-[#FEF0EF] rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[16px] leading-7 font-semibold text-textColor mb-1">
                Average Rating
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] leading-9 font-bold text-[#FF6B6B]">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </span>
                {stats.totalRating > 0 && (
                  <span className="text-[14px] text-textColor">
                    ({stats.totalRating} reviews)
                  </span>
                )}
              </div>
            </div>
            <FaStar className="text-4xl text-[#FF6B6B] opacity-80" />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Today's Appointments */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <FaClock className="text-2xl text-blue-600" />
            <div>
              <p className="text-[14px] text-textColor font-medium">Today's Appointments</p>
              <p className="text-[20px] font-bold text-blue-600">{stats.todaysAppointments}</p>
            </div>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-2xl text-orange-600" />
            <div>
              <p className="text-[14px] text-textColor font-medium">Pending Appointments</p>
              <p className="text-[20px] font-bold text-orange-600">{stats.pendingAppointments}</p>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-2xl text-green-600" />
            <div>
              <p className="text-[14px] text-textColor font-medium">Completed</p>
              <p className="text-[20px] font-bold text-green-600">{stats.completedAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="mt-8">
        <h3 className="text-[20px] leading-8 font-bold text-headingColor mb-4">
          Recent Appointments
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {stats.totalAppointments > 0 ? (
            <div className="divide-y divide-gray-100">
              {doctorData.appointments?.slice(0, 5).map((appointment, index) => (
                <div key={appointment._id || index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-headingColor">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                      </p>
                      <p className="text-[14px] text-textColor mt-1">
                        {appointment.problem || 'General Consultation'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${
                        appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        appointment.status === 'finished' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {appointment.status}
                      </span>
                      <p className="text-[14px] text-textColor mt-1">
                        ${appointment.fee || doctorData.ticketPrice || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-textColor">
              <FaCalendarCheck className="mx-auto text-4xl mb-4 opacity-50" />
              <p className="text-[16px]">No appointments yet</p>
              <p className="text-[14px] mt-2">Your upcoming appointments will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics; 