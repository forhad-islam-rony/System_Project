import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userImg from "../../assets/images/doctor-img01.png";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";

import MyBookings from "./MyBookings";
import Profile from "./Profile";
import OrderHistory from "../../components/Orders/OrderHistory";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const MyAccount = () => {
  const [tab, setTab] = React.useState("bookings");
  const { user, token, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDonating, setIsDonating] = useState(user?.isDonating || false);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      if (result.success) {
        // Update the AuthContext with latest user data
        dispatch({
          type: "UPDATE_USER",
          payload: {
            user: result.data,
            token,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if(window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log("Delete account");
    }
  };

  const toggleDonating = async () => {
    try {
        const res = await fetch(`${BASE_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...user,
          isDonating: !isDonating
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setIsDonating(!isDonating);
      dispatch({
        type: 'UPDATE_USER',
        payload: {
          user: result.data,
          token: localStorage.getItem('token')
        }
      });

      toast.success('Blood donation status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (postId) => {
    navigate(`/edit-post/${postId}`);
  };

  const handleCreatePost = async (postData, photo) => {
    try {
      let photoUrl = null;
      if (photo) {
        const uploadResult = await uploadImageToCloudinary(photo);
        photoUrl = uploadResult.url;
      }

      const res = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...postData,
          photo: photoUrl
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Post created successfully');
      setTab("posts"); // Switch to posts tab after successful creation
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="pb-[50px] px-[30px] rounded-md">
            <div className="flex items-center justify-center">
              <figure className="w-[100px] h-[100px] rounded-full border-2 border-solid border-primaryColor">
                <img
                  src={user?.photo || userImg}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              </figure>
            </div>

            <div className="text-center mt-4">
              <h3 className="text-[18px] leading-[30px] text-headingColor font-bold">
                {user?.name}
              </h3>
              <p className="text-textColor text-[15px] leading-6 font-medium">
                {user?.email}
              </p>
              <p className="text-textColor text-[15px] leading-6 font-medium">
                Blood Type:
                <span className="ml-2 text-headingColor text-[22px] leading-8">
                  {user?.bloodType || "N/A"}
                </span>
              </p>
            </div>

            <div className="mt-[50px] md:mt-[100px]">
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-[16px] leading-7 text-headingColor font-semibold">
                      Blood Donation Status
                    </h4>
                    {user?.bloodType && (
                      <p className="text-sm text-gray-500">
                        Blood Type: {user.bloodType}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDonating}
                    onClick={toggleDonating}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                      isDonating ? 'bg-primaryColor' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        isDonating ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {isDonating && (
                  <div className="mb-4">
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                      You are currently listed as a potential blood donor
                    </p>
                  </div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white hover:bg-[#181A1E]/90 transition duration-300"
              >
                Logout
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 mt-4 p-3 text-[16px] leading-7 rounded-md text-white hover:bg-red-700 transition duration-300"
              >
                Delete account
              </button>
            </div>
          </div>

          <div className="md:col-span-2 md:px-[30px]">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setTab("bookings")}
                className={`${
                  tab === "bookings" && "bg-primaryColor text-white font-normal"
                } p-1.5 px-3 text-sm rounded-md text-headingColor font-semibold leading-6
                border border-solid border-primaryColor`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setTab("orders")}
                className={`${
                  tab === "orders" && "bg-primaryColor text-white font-normal"
                } p-1.5 px-3 text-sm rounded-md text-headingColor font-semibold leading-6
                border border-solid border-primaryColor`}
              >
                My Orders
              </button>
              <button
                onClick={() => setTab("create-post")}
                className={`${
                  tab === "create-post" && "bg-primaryColor text-white font-normal"
                } p-1.5 px-3 text-sm rounded-md text-headingColor font-semibold leading-6
                border border-solid border-primaryColor`}
              >
                Create Post
              </button>
              <button
                onClick={() => setTab("posts")}
                className={`${
                  tab === "posts" && "bg-primaryColor text-white font-normal"
                } p-1.5 px-3 text-sm rounded-md text-headingColor font-semibold leading-6
                border border-solid border-primaryColor`}
              >
                Your Posts
              </button>
              <button
                onClick={() => setTab("settings")}
                className={`${
                  tab === "settings" && "bg-primaryColor text-white font-normal"
                } p-1.5 px-3 text-sm rounded-md text-headingColor font-semibold leading-6
                border border-solid border-primaryColor`}
              >
                Profile settings
              </button>
            </div>

            {tab === "bookings" && <MyBookings />}
            {tab === "orders" && <OrderHistory />}
            {tab === "create-post" && (
              <Profile 
                activeTab="create-post" 
                onUpdate={fetchUserData} 
                onCreatePost={handleCreatePost}
              />
            )}
            {tab === "posts" && <Profile activeTab="posts" onUpdate={fetchUserData} />}
            {tab === "settings" && <Profile activeTab="profile" onUpdate={fetchUserData} />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
