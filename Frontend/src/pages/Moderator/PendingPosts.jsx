import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../config';
import ModeratorLayout from '../../components/Moderator/ModeratorLayout';
import { useNavigate } from 'react-router-dom';

const PendingPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const moderatorInfo = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!moderatorInfo || !localStorage.getItem('token')) {
      navigate('/moderator/login');
      return;
    }
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching posts for division:', moderatorInfo.division);

      const res = await fetch(`${BASE_URL}/moderator/pending-posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await res.json();
      console.log('API Response:', result);

      if (!res.ok) {
        throw new Error(result.message);
      }

      setPosts(result.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error(error.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/moderator/posts/${postId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Post approved successfully');
      fetchPendingPosts(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to approve post');
    }
  };

  const handleReject = async (postId) => {
    try {
      const reason = prompt('Please enter rejection reason:');
      if (!reason) return;

      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/moderator/posts/${postId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Post rejected successfully');
      fetchPendingPosts(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to reject post');
    }
  };

  if (loading) {
    return (
      <ModeratorLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
        </div>
      </ModeratorLayout>
    );
  }

  return (
    <ModeratorLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Pending Posts - {moderatorInfo?.division} Division
        </h1>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-center">No pending posts to review</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Posted by: {post.user?.name} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(post._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(post._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{post.content}</p>

                {post.images?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Category: {post.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModeratorLayout>
  );
};

export default PendingPosts; 