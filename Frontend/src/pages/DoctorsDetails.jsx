import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import starIcon from "../assets/images/Star.png";
import DoctorAbout from "./DoctorAbout";
import Feedback from "./Feedback";
import SidePanel from "./SidePanel";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure styles are imported


const DoctorsDetails = () => {
  const [tab, setTab] = useState("about");
  const [doctor, setDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]); // Keep this for specialization view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchDoctorDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/doctors/${id}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setDoctor(result.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      toast.error(err.message);
    }
  };

  const fetchDoctorsBySpecialization = async () => {
    try {
      const res = await fetch(`${BASE_URL}/doctors/specialization/${encodeURIComponent(id)}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setDoctors(result.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      fetchDoctorDetails();
    } else {
      fetchDoctorsBySpecialization();
    }
  }, [id]);

  const handleReviewSubmit = (doctorData) => {
    if (doctorData) {
      // Update just the rating fields without a full refetch
      setDoctor(prev => ({
        ...prev,
        averageRating: doctorData.averageRating,
        totalRating: doctorData.totalRating
      }));
    } else {
      // Fallback to full refetch
      fetchDoctorDetails();
    }
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

  // For single doctor view
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    if (!doctor) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-gray-600">Doctor not found.</p>
        </div>
      );
    }

    return (
      <section className="pt-[50px]">
        <div className="max-w-[1170px] px-5 mx-auto">
          <div className="grid md:grid-cols-3 gap-[50px]">
            <div className="md:col-span-2">
              {/* Doctor Info Section */}
              <div className="flex flex-col md:flex-row gap-5 mb-8">
                <figure className="w-full md:w-[200px] h-[200px] flex-shrink-0">
                  <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover rounded-lg" />
                </figure>
                <div className="flex flex-col">
                  <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-6 lg:py-2 lg:px-6 
                          text-[12px] leading-4 lg:text-[16px] lg:leading-7 font-semibold rounded w-fit">
                    {doctor.specialization}
                  </span>

                  <h3 className="text-headingColor text-[22px] leading-9 mt-3 font-bold">
                    {doctor.name}
                  </h3>

                  <div className="flex items-center gap-[6px]">
                    <span className="flex items-center gap-[6px] text-[14px] leading-5 lg:text-[16px] lg:leading-7 
                              font-semibold text-headingColor">
                      <img src={starIcon} alt="" />
                      {Number(doctor.averageRating || 0).toFixed(1)}
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

              {/* Tabs Section */}
              <div className="border-b border-solid border-[#0066ff34] mb-8">
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

              {/* Content Section */}
              <div className="mt-8">
                {tab === "about" && <DoctorAbout doctor={doctor} />}
                {tab === "feedback" && (
                  <Feedback 
                    doctorId={doctor._id} 
                    onReviewSubmit={handleReviewSubmit}
                  />
                )}
              </div>
            </div>

            {/* Side Panel */}
            <div className="md:col-span-1">
              <div className="md:sticky md:top-24">
                <SidePanel doctor={doctor} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // For specialization view
  if (doctors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">No doctors found for this specialization.</p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-5 py-14">
      <h2 className="heading text-center mb-[30px]">
        {id} Specialists
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            onClick={() => navigate(`/doctors/${doctor._id}`)}
            className="cursor-pointer p-3 lg:p-5 bg-white rounded-[10px] shadow-md hover:shadow-lg transition"
          >
            <div>
              <img src={doctor.photo} className="w-full h-[200px] object-cover rounded-[10px]" alt="" />
            </div>

            <h2 className="text-[18px] leading-[30px] lg:text-[26px] lg:leading-9 text-headingColor font-[700] mt-3">
              {doctor.name}
            </h2>

            <div className="mt-2 lg:mt-4 flex items-center justify-between">
              <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-2 lg:py-2 lg:px-6 text-[12px] leading-4 lg:text-[16px] lg:leading-7 font-semibold rounded">
                {doctor.specialization}
              </span>

              <div className="flex items-center gap-[6px]">
                <span className="flex items-center gap-[6px] text-[14px] leading-6 lg:text-[16px] lg:leading-7 font-semibold text-headingColor">
                  <img src={starIcon} alt="" /> {doctor.averageRating}
                </span>
                <span className="text-[14px] leading-6 lg:text-[16px] lg:leading-7 font-[400] text-textColor">
                  ({doctor.totalRating})
                </span>
              </div>
            </div>

            <div className="mt-[18px] lg:mt-5 flex items-center justify-between">
              <div>
                {doctor.hospital && (
                  <h3 className="text-[14px] leading-7 lg:text-[16px] lg:leading-[30px] font-semibold text-headingColor">
                    {doctor.hospital}
                  </h3>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DoctorsDetails;
