import React from "react";
import { doctorsapn } from "../assets/data/doctorsapn";
import { useParams } from "react-router-dom";
import starIcon from "../assets/images/Star.png";
import DoctorAbout from "./DoctorAbout";
import Feedback from "./Feedback";
import SidePanel from "./SidePanel";
import { useNavigate } from "react-router-dom";

const DoctorsDetails = () => {
  const [tab, setTab] = React.useState("about");
  const { id } = useParams(); // Get the doctor ID from the URL
  const doctor = doctorsapn.find((doc) => doc.id === id); // Find doctor by ID
  const navigate = useNavigate();

  if (!doctor) {
    return <p className="text-center mt-10 text-xl">Doctor not found!</p>;
  }

  // Filter related doctors based on speciality
  const relatedDoctors = doctorsapn.filter(
    (doc) => doc.speciality === doctor.speciality && doc.id !== id
  );

  const handleCardClick = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top of the page
  };

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
                <span
                  className="bg-[#CCF0F3] text-irisBlueColor py-1 px-6 lg:py-2 lg:px-6 
                        text-[12px] leading-4 lg:text-[16px] lg:leading-7 font-semibold rounded"
                >
                  {doctor.speciality}
                </span>

                <h3 className="text-headingColor text-[22px] leading-9 mt-3 font-bold">
                  {doctor.name}
                </h3>

                <div className="flex items-center gap-[6px]">
                  <span
                    className="flex items-center gap-[6px] text-[14px] leading-5 lg:text-[16px] lg:leading-7 
                            font-semibold text-headingColor"
                  >
                    <img src={starIcon} alt="" />
                    4.8
                  </span>
                  <span
                    className="text-[14px] leading-5 lg:text-[16px] lg:leading-7 font-[400]
                            text-textColor"
                  >
                    (272)
                  </span>
                </div>

                <p className="text_para text-[14px] leading-6 md:text-[15px] lg:max-w-[390px]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                  hac habitasse platea dictumst. Integer nec odio.
                </p>
              </div>
            </div>

            <div className="mt-[50px] border-b border-solid border-[#0066ff34]">
              <button
                onClick={() => setTab("about")}
                className={`${
                  tab === "about" && "border-b border-solid border-primarColor"
                }
                            py-2 px-5 mr-5 text-[16px] leading-7 text-headingColor font-semibold`}
              >
                About
              </button>
              <button
                onClick={() => setTab("feedback")}
                className={`${
                  tab === "feedback" &&
                  "border-b border-solid border-primarColor"
                }
                            py-2 px-5 mr-5 text-[16px] leading-7 text-headingColor font-semibold`}
              >
                Feedback
              </button>
            </div>

            <div className="mt-[50px]">
              {tab === "about" && <DoctorAbout />}
              {tab === "feedback" && <Feedback />}
            </div>
          </div>

          <div>
            <SidePanel />
          </div>
        </div>

        {/* Related Doctors Section */}
        <div className="mt-10 flex flex-col items-center">
          <h3 className="text-headingColor text-xl font-bold mb-5">
            Related Doctors
          </h3>
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              maxWidth: "1170px",
              width: "100%",
            }}
          >
            {relatedDoctors.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden cursor-pointer hover:translate-y-[-5px] transition-transform duration-300"
                onClick={() => handleCardClick(item.id)}
              >
                {/* Image */}
                <img
                  className="w-full h-80 object-cover bg-blue-50"
                  src={item.photo}
                  alt={item.name}
                />
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-green-500 mb-3">
                    <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                    <p>Available</p>
                  </div>
                  <p className="text-gray-900 text-xl font-semibold mb-2">
                    {item.name}
                  </p>
                  <p className="text-gray-600 text-md">{item.speciality}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorsDetails;
