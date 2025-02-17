import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../config';
import AdminLayout from '../../components/Admin/AdminLayout';

const ManageModerators = () => {
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    division: ''
  });

  const divisions = [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh'
  ];

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    try {
      console.log('Fetching moderators...');
      const res = await fetch(`${BASE_URL}/admin/moderators`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await res.json();
      console.log('Moderators response:', result);

      if (!res.ok) {
        throw new Error(result.message);
      }

      setModerators(result.data);
    } catch (error) {
      console.error('Error fetching moderators:', error);
      toast.error(error.message || 'Failed to fetch moderators');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/admin/moderators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Moderator created successfully');
      setFormData({
        name: '',
        email: '',
        password: '',
        division: ''
      });
      fetchModerators();
    } catch (error) {
      toast.error(error.message || 'Failed to create moderator');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this moderator?')) {
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/admin/moderators/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Moderator deleted successfully');
      fetchModerators();
    } catch (error) {
      toast.error(error.message);
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
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Manage Moderators</h2>

        {/* Create Moderator Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold mb-4">Create New Moderator</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:border-primaryColor"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:border-primaryColor"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:border-primaryColor"
                required
              />
              <select
                name="division"
                value={formData.division}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:border-primaryColor"
                required
              >
                <option value="">Select Division</option>
                {divisions.map(division => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-primaryColor text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Moderator'}
            </button>
          </form>
        </div>

        {/* Moderators List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {moderators.map((moderator) => (
                  <tr key={moderator._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{moderator.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{moderator.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{moderator.division}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        moderator.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {moderator.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(moderator._id)}
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

export default ManageModerators; 