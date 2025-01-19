import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import DoctorProfile from "./DoctorProfile";
import Appointments from "./Appointments";
import Statistics from "./Statistics";
import userImg from "../../assets/images/avatar-icon.png";

const DoctorAccount = () => {
  const [tab, setTab] = React.useState("overview");
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'doctor') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  return (
    <section className="max-w-[1170px] px-5 mx-auto">
      <div className="grid md:grid-cols-4 gap-10">
        {/* Sidebar */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center">
            <figure className="w-[150px] h-[150px] rounded-full border-4 border-solid border-primaryColor">
              <img
                src={user?.photo || userImg}
                alt="doctor"
                className="w-full h-full rounded-full object-cover"
              />
            </figure>
            
            <div className="text-center mt-4">
              <h3 className="text-[22px] leading-[30px] text-headingColor font-bold">
                Dr. {user?.name}
              </h3>
              <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-4 rounded text-[14px] leading-5">
                {user?.specialization}
              </span>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="bg-[#FFF9EA] text-yellowColor py-1 px-4 rounded text-[14px] leading-5">
                  {user?.totalPatients} Patients
                </span>
                <span className="bg-[#FEF0EF] text-[#FF0000] py-1 px-4 rounded text-[14px] leading-5">
                  {user?.yearsOfExperience}+ Years
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 w-full">
              <h4 className="text-[16px] leading-7 text-headingColor font-semibold mb-2">
                Today's Stats
              </h4>
              <div className="bg-[#F8F9FA] p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-textColor">Appointments</span>
                  <span className="text-headingColor font-medium">15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-textColor">Available Slots</span>
                  <span className="text-headingColor font-medium">8</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 w-full">
              <button 
                onClick={handleLogout}
                className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white hover:bg-[#181A1E]/90 transition duration-300"
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
            {tab === "overview" && <Statistics />}
            {tab === "appointments" && <Appointments />}
            {tab === "settings" && <DoctorProfile />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorAccount; 