import React from 'react';

const Appointments = () => {
  const appointments = [
    {
      id: 1,
      patientName: "John Doe",
      date: "2024-03-20",
      time: "10:00 AM",
      status: "upcoming",
      type: "Consultation"
    },
    // Add more appointments...
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[24px] leading-9 font-bold text-headingColor">
          Appointments
        </h2>
        <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor">
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <table className="w-full">
        <thead className="bg-[#F8F9FA] text-left">
          <tr>
            <th className="py-4 px-6">Patient</th>
            <th className="py-4 px-6">Date</th>
            <th className="py-4 px-6">Time</th>
            <th className="py-4 px-6">Type</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(appointment => (
            <tr key={appointment.id} className="border-b">
              <td className="py-4 px-6">{appointment.patientName}</td>
              <td className="py-4 px-6">{appointment.date}</td>
              <td className="py-4 px-6">{appointment.time}</td>
              <td className="py-4 px-6">{appointment.type}</td>
              <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  appointment.status === 'upcoming' 
                    ? 'bg-[#CCF0F3] text-irisBlueColor'
                    : appointment.status === 'completed'
                    ? 'bg-[#E1F7E3] text-[#2ED16C]'
                    : 'bg-[#FEF0EF] text-[#FF0000]'
                }`}>
                  {appointment.status}
                </span>
              </td>
              <td className="py-4 px-6">
                <button className="text-primaryColor hover:underline">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments; 