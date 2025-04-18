import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { 
  getAllDrivers, 
  createDriver, 
  updateDriver, 
  deleteDriver 
} from '../../services/ambulanceService';

const ManageDriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [formData, setFormData] = useState({
    driverName: '',
    phone: '',
    licenseNumber: '',
    address: '',
    location: '',
    status: 'available'
  });

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await getAllDrivers();
      setDrivers(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch drivers');
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editDriver) {
        await updateDriver(editDriver._id, formData);
        toast.success('Driver updated successfully');
      } else {
        await createDriver(formData);
        toast.success('Driver added successfully');
      }
      setShowForm(false);
      setEditDriver(null);
      setFormData({
        driverName: '',
        phone: '',
        licenseNumber: '',
        address: '',
        location: '',
        status: 'available'
      });
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save driver');
    }
  };

  const handleEdit = (driver) => {
    setEditDriver(driver);
    setFormData({
      driverName: driver.driverName,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      address: driver.address,
      location: driver.location,
      status: driver.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteDriver(id);
        toast.success('Driver deleted successfully');
        fetchDrivers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete driver');
      }
    }
  };

  if (loading && drivers.length === 0) {
    return (
      <section className="pt-[60px] pb-[60px] bg-[#f5f5f5]">
        <div className="container flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-[60px] pb-[60px] bg-[#f5f5f5]">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="heading">Manage Ambulance Drivers</h2>
            <p className="text_para">Add, edit, or remove ambulance drivers</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/admin/ambulance"
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              <FaArrowLeft />
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                setEditDriver(null);
                setFormData({
                  driverName: '',
                  phone: '',
                  licenseNumber: '',
                  address: '',
                  location: '',
                  status: 'available'
                });
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-primaryColor/90"
            >
              <FaUserPlus />
              Add New Driver
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-[20px] shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {editDriver ? 'Edit Driver' : 'Add New Driver'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primaryColor text-white rounded-md hover:bg-primaryColor/90"
                >
                  {editDriver ? 'Update' : 'Add'} Driver
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white p-6 rounded-[20px] shadow-md">
          <h3 className="text-xl font-semibold mb-6">All Drivers</h3>
          
          {drivers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No drivers found. Add your first driver!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.map((driver) => (
                    <tr key={driver._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{driver.driverName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{driver.phone}</div>
                        <div className="text-gray-500 text-sm">{driver.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{driver.licenseNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{driver.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          driver.status === 'available' ? 'bg-green-100 text-green-800' : 
                          driver.status === 'busy' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(driver)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(driver._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ManageDriversPage; 