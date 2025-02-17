import React, { useState, useEffect } from 'react';
import { FaSearch, FaHeart, FaComment, FaShare } from 'react-icons/fa';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const categories = [
    'All',
    'Medical Experience',
    'Doctor Review',
    'Treatment Issue',
    'Healthcare Facility Review',
    'Medical Advice',
    'Emergency Service Experience',
    'Others'
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/posts`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setPosts(result.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (postId) => {
    navigate(`/edit-post/${postId}`);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || selectedCategory === '' || 
                           post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
      </div>
    );
  }

  return (
    <section className="pt-[60px] pb-[60px] bg-[#f5f5f5]">
      <div className="container">
        {/* Header and Search Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-8">
          <div className="xl:w-[600px] mx-auto text-center mb-8">
            <h2 className="heading">Medical Community Hub</h2>
            <p className="text_para">
              Share experiences and connect with others in your healthcare journey
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px]"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-auto px-4 py-3 rounded-full border border-[#0066ff61] focus:outline-none focus:border-primaryColor text-[16px]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No posts found</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={post.user?.photo || '/default-avatar.jpg'}
                      alt={post.user?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{post.user?.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span>{post.division}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h2 className="text-xl font-bold mb-3">{post.title}</h2>
                  <p className="text-gray-700 mb-4">{post.content}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-primaryColor px-3 py-1 rounded-full text-sm">
                      {post.category}
                    </span>
                  </div>

                  {/* Post Images */}
                  {post.images?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-primaryColor">
                        <FaHeart /> <span>{post.likes?.length || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-primaryColor">
                        <FaComment /> <span>{post.comments?.length || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-primaryColor">
                        <FaShare />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {post.views} views
                    </span>
                  </div>

                  {/* Edit Button */}
                  {post.user?._id === user?._id && post.status !== "approved" && (
                    <button
                      onClick={() => handleEdit(post._id)}
                      className="text-primaryColor hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Community; 