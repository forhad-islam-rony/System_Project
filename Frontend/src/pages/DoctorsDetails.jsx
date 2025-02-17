import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import starIcon from "../assets/images/Star.png";
import DoctorAbout from "./DoctorAbout";
import Feedback from "./Feedback";
import SidePanel from "./SidePanel";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

const DoctorsDetails = () => {
  const [tab, setTab] = useState("about");
  const [doctor, setDoctor] = useState(null);
  const [relatedDoctors, setRelatedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/doctors/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctor details');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setDoctor(result.data);
          fetchRelatedDoctors(result.data.specialization);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const fetchRelatedDoctors = async (specialization) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/doctors?specialization=${specialization}`);
      const result = await response.json();
      
      if (result.success) {
        // Filter out the current doctor and limit to maybe 3 related doctors
        const filtered = result.data.filter(doc => doc._id !== id).slice(0, 3);
        setRelatedDoctors(filtered);
      }
    } catch (err) {
      console.error("Error fetching related doctors:", err);
    }
  };

  const handleCardClick = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-xl">Error: {error}</p>
      </div>
    );
  }

  if (!doctor) {
    return <p className="text-center mt-10 text-xl">Doctor not found!</p>;
  }

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        <div className="grid md:grid-cols-3 gap-[50px]">
          <div className="md:col-span-2">
            <div className="flex items-center gap-5">
              <figure className="max-w-[200px] max-h-[200px]">
                <img src={doctor.photo} alt={doctor.name} className="w-full" />
              </figure>
              <div>
                <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-6 lg:py-2 lg:px-6 
                        text-[12px] leading-4 lg:text-[16px] lg:leading-7 font-semibold rounded">
                  {doctor.specialization}
                </span>

                <h3 className="text-headingColor text-[22px] leading-9 mt-3 font-bold">
                  {doctor.name}
                </h3>

                <div className="flex items-center gap-[6px]">
                  <span className="flex items-center gap-[6px] text-[14px] leading-5 lg:text-[16px] lg:leading-7 
                            font-semibold text-headingColor">
                    <img src={starIcon} alt="" />
                    {doctor.averageRating || 0}
                  </span>
                  <span className="text-[14px] leading-5 lg:text-[16px] lg:leading-7 font-[400]
                            text-textColor">
                    ({doctor.totalRating || 0})
                  </span>
                </div>

                <p className="text_para text-[14px] leading-6 md:text-[15px] lg:max-w-[390px]">
                  {doctor.bio || "No bio available"}
                </p>
              </div>
            </div>

            <div className="mt-[50px] border-b border-solid border-[#0066ff34]">
              <button
                onClick={() => setTab("about")}
                className={`${
                  tab === "about" && "border-b border-solid border-primarColor"
                } py-2 px-5 mr-5 text-[16px] leading-7 text-headingColor font-semibold`}
              >
                About
              </button>
              <button
                onClick={() => setTab("feedback")}
                className={`${
                  tab === "feedback" && "border-b border-solid border-primarColor"
                } py-2 px-5 mr-5 text-[16px] leading-7 text-headingColor font-semibold`}
              >
                Feedback
              </button>
            </div>

            <div className="mt-[50px]">
              {tab === "about" && <DoctorAbout doctor={doctor} />}
              {tab === "feedback" && <Feedback doctor={doctor} />}
            </div>
          </div>

          <div>
            <SidePanel doctor={doctor} />
          </div>
        </div>

        {/* Related Doctors Section */}
        {relatedDoctors.length > 0 && (
          <div className="mt-10 flex flex-col items-center">
            <h3 className="text-headingColor text-xl font-bold mb-5">
              Related Doctors
            </h3>
            <div className="grid gap-6"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                maxWidth: "1170px",
                width: "100%",
              }}>
              {relatedDoctors.map((item) => (
                <div
                  key={item._id}
                  className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden cursor-pointer hover:translate-y-[-5px] transition-transform duration-300"
                  onClick={() => handleCardClick(item._id)}
                >
                  <img
                    className="w-full h-80 object-cover bg-blue-50"
                    src={item.photo}
                    alt={item.name}
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-sm text-green-500 mb-3">
                      <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                      <p>{item.isAvailable ? "Available" : "Not Available"}</p>
                    </div>
                    <p className="text-gray-900 text-xl font-semibold mb-2">
                      {item.name}
                    </p>
                    <p className="text-gray-600 text-md">{item.specialization}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorsDetails;
