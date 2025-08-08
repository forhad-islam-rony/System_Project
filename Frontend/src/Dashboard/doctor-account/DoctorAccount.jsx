import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import DoctorProfile from "./DoctorProfile";
import Appointments from "./Appointments";
import Statistics from "./Statistics";
import userImg from "../../assets/images/avatar-icon.png";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";

const DoctorAccount = () => {
  const [tab, setTab] = React.useState("overview");
  const { user, dispatch } = useContext(AuthContext);
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'doctor') {
      navigate('/login');
      return;
    }
    
    fetchDoctorProfile();
  }, [navigate]);

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/doctors/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setDoctorData(result.data);
      
      // Update the context with fresh data
      dispatch({
        type: 'UPDATE_USER',
        payload: {
          user: result.data
        }
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.message || 'Failed to fetch profile data');
      console.error('Profile fetch error:', error);
    }
  };

    const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HashLoader size={50} color="#0067FF" />
      </div>
    );
  }

  const displayData = doctorData || user;

  return (
    <section className="max-w-[1170px] px-5 mx-auto">
      <div className="grid md:grid-cols-4 gap-10">
        {/* Sidebar */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center">
            <figure className="w-[150px] h-[150px] rounded-full border-4 border-solid border-primaryColor">
              <img
                src={displayData?.photo || userImg}
                alt="doctor"
                className="w-full h-full rounded-full object-cover"
              />
            </figure>
            
            <div className="text-center mt-4">
              <h3 className="text-[22px] leading-[30px] text-headingColor font-bold">
                Dr. {displayData?.name}
              </h3>
              <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-4 rounded text-[14px] leading-5">
                {displayData?.specialization || 'Not specified'}
              </span>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="bg-[#FFF9EA] text-yellowColor py-1 px-4 rounded text-[14px] leading-5">
                  {displayData?.appointments?.length || 0} Appointments
                </span>
                <span className="bg-[#FEF0EF] text-[#FF0000] py-1 px-4 rounded text-[14px] leading-5">
                  ${displayData?.ticketPrice || 0} Fee
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 w-full">
              <h4 className="text-[16px] leading-7 text-headingColor font-semibold mb-2">
                Quick Stats
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#F8F9FA] rounded-lg">
                  <span className="text-[14px] text-textColor">Total Appointments</span>
                  <span className="text-[16px] font-bold text-primaryColor">
                    {displayData?.appointments?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#F8F9FA] rounded-lg">
                  <span className="text-[14px] text-textColor">Rating</span>
                  <span className="text-[16px] font-bold text-primaryColor">
                    {displayData?.averageRating ? displayData.averageRating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#F8F9FA] rounded-lg">
                  <span className="text-[14px] text-textColor">Status</span>
                  <span className={`text-[12px] font-medium px-2 py-1 rounded ${
                    displayData?.isAvailable 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {displayData?.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 w-full">
              <button 
                onClick={handleLogout}
                className="w-full py-2 px-4 bg-red-500 text-white rounded-lg text-[14px] font-medium hover:bg-red-600 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {/* Tab Navigation */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setTab("overview")}
              className={`${
                tab === "overview" 
                  ? "bg-primaryColor text-white" 
                  : "bg-transparent text-headingColor"
              } py-2 px-5 rounded-lg text-[16px] leading-7 border border-solid border-primaryColor`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab("appointments")}
              className={`${
                tab === "appointments" 
                  ? "bg-primaryColor text-white" 
                  : "bg-transparent text-headingColor"
              } py-2 px-5 rounded-lg text-[16px] leading-7 border border-solid border-primaryColor`}
            >
              Appointments
            </button>
            <button
              onClick={() => setTab("settings")}
              className={`${
                tab === "settings" 
                  ? "bg-primaryColor text-white" 
                  : "bg-transparent text-headingColor"
              } py-2 px-5 rounded-lg text-[16px] leading-7 border border-solid border-primaryColor`}
            >
              Profile Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {tab === "overview" && <Statistics doctorData={displayData} />}
            {tab === "appointments" && <Appointments doctorData={displayData} />}
            {tab === "settings" && <DoctorProfile onProfileUpdate={fetchDoctorProfile} />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorAccount; 