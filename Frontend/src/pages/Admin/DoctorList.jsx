import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";
import AdminLayout from "../../components/Admin/AdminLayout";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setDoctors(result.data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async (doctorId, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/doctors/${doctorId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success(`Doctor ${newStatus} successfully`);
      fetchDoctors();
    } catch (error) {
      toast.error(error.message || "Failed to update doctor status");
    }
  };

  const handleAvailabilityToggle = async (doctorId, currentAvailability) => {
    try {
      const newAvailability = !currentAvailability;

      const res = await fetch(`${BASE_URL}/doctors/${doctorId}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: newAvailability }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success(`Doctor is now ${newAvailability ? "Available" : "Not Available"}`);
      
      // Update doctors state locally
      setDoctors(doctors.map(doc => 
        doc._id === doctorId ? { ...doc, isAvailable: newAvailability } : doc
      ));

    } catch (error) {
      toast.error(error.message || "Failed to update availability");
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/admin/doctors/${doctorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success("Doctor deleted successfully");
      fetchDoctors();
    } catch (error) {
      toast.error(error.message || "Failed to delete doctor");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4">Doctors Management</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={doctor.photo || "/default-doctor.png"}
                            alt={doctor.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{doctor.specialization}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${doctor.isApproved === "approved" ? "bg-green-100 text-green-800" : 
                            doctor.isApproved === "pending" ? "bg-yellow-100 text-yellow-800" : 
                            "bg-red-100 text-red-800"}`}
                      >
                        {doctor.isApproved}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAvailabilityToggle(doctor._id, doctor.isAvailable)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold text-white 
                          ${doctor.isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}
                      >
                        {doctor.isAvailable ? "Available" : "Not Available"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <select
                        value={doctor.isApproved}
                        onChange={(e) => handleApprovalChange(doctor._id, e.target.value)}
                        className="text-sm border rounded p-1 mr-2"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => handleDelete(doctor._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DoctorList;
