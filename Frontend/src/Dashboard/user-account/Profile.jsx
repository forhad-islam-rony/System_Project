import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config';
import uploadImageToCloudinary from '../../utils/uploadCloudinary';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';
import { FaImage, FaMapMarkerAlt } from 'react-icons/fa';
import { MdCreate, MdHistory } from 'react-icons/md';

const Profile = ({ activeTab = 'profile', onUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    photo: null,
    gender: '',
    bloodType: '',
    phone: '',
    district: '',
    location: '',
    isDonating: false
  });
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    division: '',
    category: '',
    images: []
  });
  const [userPosts, setUserPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);

  const navigate = useNavigate();
  

  // Bangladesh Districts Array
  const bangladeshDistricts = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
    'Comilla', 'Narayanganj', 'Gazipur', 'Bogra', 'Kushtia', 'Jessore', 'Dinajpur',
    'Tangail', 'Faridpur', 'Noakhali', 'Feni', 'Brahmanbaria', 'Pabna', 'Narsingdi',
    'Sirajganj', 'Chandpur', 'Cox\'s Bazar', 'Rangamati', 'Bandarban', 'Khagrachari',
    'Sunamganj', 'Habiganj', 'Moulvibazar', 'Netrokona', 'Kishoreganj', 'Jamalpur',
    'Sherpur', 'Munshiganj', 'Gopalganj', 'Shariatpur', 'Madaripur', 'Rajbari',
    'Magura', 'Jhenaidah', 'Narail', 'Satkhira', 'Bagerhat', 'Chuadanga', 'Meherpur',
    'Pirojpur', 'Jhalokati', 'Bhola', 'Patuakhali', 'Barguna', 'Panchagarh', 'Thakurgaon',
    'Nilphamari', 'Lalmonirhat', 'Kurigram', 'Gaibandha', 'Joypurhat', 'Naogaon',
    'Natore', 'Chapainawabganj', 'Lakshmipur'
  ].sort();

  // Bangladesh Divisions Array
  const bangladeshDivisions = [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh'
  ];

  // Post Categories Array
  const postCategories = [
    'Medical Experience',
    'Doctor Review',
    'Treatment Issue',
    'Healthcare Facility Review',
    'Medical Advice',
    'Emergency Service Experience',
    'Others'
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/profile/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          _id: result.data._id,
          name: result.data.name || '',
          email: result.data.email || '',
          photo: result.data.photo || null,
          gender: result.data.gender || '',
          bloodType: result.data.bloodType || '',
          phone: result.data.phone || '',
          district: result.data.district || '',
          location: result.data.location || '',
          isDonating: result.data.isDonating || false
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message || 'Failed to fetch user data');
    }
  };

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = async event => {
    const file = event.target.files[0];
    const data = await uploadImageToCloudinary(file);
    setSelectedFile(data.url);
    setFormData({ ...formData, photo: data.url });
  };

  const submitHandler = async e => {
    e.preventDefault();
    setLoading(true);

    try {
    const res = await fetch(`${BASE_URL}/users/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          photo: formData.photo,
          gender: formData.gender,
          bloodType: formData.bloodType,
          district: formData.district,
          location: formData.location,
          isDonating: formData.isDonating
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setLoading(false);
      toast.success('Profile updated successfully');
      
      // Call the onUpdate prop to refresh parent component
      if (onUpdate) {
        onUpdate();
      }

    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Something went wrong');
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
  
    if (!postFormData.title || !postFormData.content || !postFormData.division || !postFormData.category) {
      toast.error("Please fill all required fields");
      return;
    }
  
    setLoading(true);
  
    try {
      // Extract only the URLs from the images array
      const imageUrls = postFormData.images.map(img => img.url);
  
      const requestBody = {
        title: postFormData.title,
        content: postFormData.content,
        division: postFormData.division,
        category: postFormData.category,
        images: imageUrls, // Send only the URLs
      };
  
      let res, result;
  
      if (editingPostId) {
        // **Update existing post**
        res = await fetch(`${BASE_URL}/posts/${editingPostId}`, {
          method: "PUT", // Use PUT for updating
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestBody),
        });
      } else {
        // **Create new post**
        res = await fetch(`${BASE_URL}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestBody),
        });
      }
  
      result = await res.json();
  
      if (!res.ok) {
        throw new Error(result.message || "Failed to submit post");
      }
  
      toast.success(editingPostId ? "Post updated successfully" : "Post created successfully");
  
      // Reset form & editing state
      setPostFormData({
        title: "",
        content: "",
        division: "",
        category: "",
        images: [],
      });
      setEditingPostId(null); // Clear editing state
  
      fetchUserPosts(); // Refresh posts
    } catch (err) {
      console.error("Post submission error:", err);
      toast.error(err.message || "Failed to submit post");
    } finally {
      setLoading(false);
    }
  };
  

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/posts/user/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch posts');
      }

      if (result.success) {
        setUserPosts(result.data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      toast.error(err.message || 'Failed to fetch your posts');
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchUserPosts();
    }
  }, [activeTab]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // Upload to Cloudinary first
      const result = await uploadImageToCloudinary(file);
      
      if (!result || !result.url) {
        throw new Error('Failed to get upload URL');
      }

      // Add the cloudinary URL to images array
      setPostFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: result.url, isPreview: false }]
      }));

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setPostFormData(prev => {
      const newImages = prev.images.filter((_, index) => index !== indexToRemove);
      // Clean up preview URL if it's a preview
      const removedImage = prev.images[indexToRemove];
      if (removedImage.isPreview) {
        URL.revokeObjectURL(removedImage.url);
      }
      return {
        ...prev,
        images: newImages
      };
    });
  };

  const handleEditPost = (post) => {
    // Set the form data for editing
    setPostFormData({
      title: post.title,
      content: post.content,
      division: post.division,
      category: post.category,
      images: post.images
    });
    setEditingPostId(post._id); // Add this state to track which post is being edited
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
            const res = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Post deleted successfully');
      fetchUserPosts(); // Refresh the posts list
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  return (
    <div className='mt-10'>
      {/* Profile Settings Section */}
      {activeTab === 'profile' && (
        <form onSubmit={submitHandler}>
          <div className="mb-5">
            <label htmlFor="photo" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-3">
              {formData.photo && (
                <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                </figure>
              )}

              <div className="relative w-[130px] h-[50px]">
                <input
                  type="file"
                  name="photo"
                  id="photo"
                  onChange={handleFileInputChange}
                  accept=".jpg,.png"
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
                <label
                  htmlFor="photo"
                  className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer"
                >
                  Upload Photo
                </label>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="name" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
              readOnly
            />
          </div>

          <div className="mb-5">
            <label htmlFor="phone" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="bloodType" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
              Blood Type
            </label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="mb-5">
            <label htmlFor="district" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
              District
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
            >
              <option value="">Select District</option>
              {bangladeshDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label htmlFor="location" className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
              Specific Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter your specific location (e.g., area, street)"
              className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor rounded-lg"
            />
          </div>

          <div className="mb-5">
            <label className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
              Gender
            </label>
            <div className="flex gap-5">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Male
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Female
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Other
              </label>
            </div>
          </div>

          <div className="mt-7">
            <button
              type="submit"
              className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3"
              disabled={loading}
            >
              {loading ? <HashLoader size={25} color="#ffffff" /> : 'Update Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Create Post Section */}
      {activeTab === 'create-post' && (
        <div className="bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-2xl font-bold mb-6">Create New Post</h3>
          <form onSubmit={handlePostSubmit}>
            <div className="mb-5">
              <input
                type="text"
                placeholder="Post Title"
                value={postFormData.title}
                onChange={(e) => setPostFormData({...postFormData, title: e.target.value})}
                className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] rounded-lg"
                required
              />
            </div>

            <div className="mb-5">
              <textarea
                placeholder="Write your post content..."
                value={postFormData.content}
                onChange={(e) => setPostFormData({...postFormData, content: e.target.value})}
                className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] rounded-lg min-h-[200px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <select
                  value={postFormData.division}
                  onChange={(e) => setPostFormData({...postFormData, division: e.target.value})}
                  className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] rounded-lg"
                  required
                >
                  <option value="">Select Division *</option>
                  {bangladeshDivisions.map((division) => (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  ))}
                </select>
                {postFormData.division === '' && (
                  <p className="text-red-500 text-sm mt-1">Division is required</p>
                )}
              </div>

              <div>
                <select
                  value={postFormData.category}
                  onChange={(e) => setPostFormData({...postFormData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] rounded-lg"
                  required
                >
                  <option value="">Select Category</option>
                  {postCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-headingColor text-[16px] leading-[30px] font-bold mb-2">
                Upload Images
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="photo"
                  id="customFile"
                  accept=".jpg,.png"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-solid border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px] rounded-lg"
                />
                {loading && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <HashLoader size={20} color="#0067FF" />
                  </div>
                )}
              </div>
              
              {/* Image Previews */}
              {postFormData.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-[16px] leading-[30px] font-semibold mb-2">Image Previews:</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {postFormData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {image.isPreview && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <HashLoader size={20} color="#ffffff" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3"
              disabled={loading}
            >
              {loading ? <HashLoader size={25} color="#ffffff" /> : 'Create Post'}
            </button>
          </form>
        </div>
      )}

      {/* Your Posts Section */}
      {activeTab === 'posts' && (
        <div className="max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
          <div className="space-y-6">
            {userPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg p-6 shadow-md">
                {/* Post Header with Status */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      {/* Post Status Badge */}
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        post.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {/* Post Actions */}
                  <div className="flex gap-2">
                    {post.status === 'pending' && (
                      <button
                        onClick={() => handleEditPost(post)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {post.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Content */}
                <p className="text-gray-700 mb-4">{post.content}</p>
                
                {/* Post Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    <FaMapMarkerAlt />
                    {post.division}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <i className="far fa-eye"></i> {post.views} views
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <i className="far fa-comment"></i> {post.comments?.length || 0} comments
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <i className="far fa-heart"></i> {post.likes?.length || 0} likes
                  </span>
                </div>

                {/* Rejection Message if any */}
                {post.status === 'rejected' && post.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                    <strong>Rejection Reason:</strong> {post.rejectionReason}
                  </div>
                )}
              </div>
            ))}
            {userPosts.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                You haven't created any posts yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;