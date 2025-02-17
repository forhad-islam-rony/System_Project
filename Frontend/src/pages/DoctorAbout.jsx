import React from "react";
import { formateDate } from "../utils/formateDate";

const DoctorAbout = ({ doctor }) => {
  if (!doctor) return <p>No doctor data found.</p>;

  return (
    <div>
      {/* Doctor Bio */}
      <div>
        <h3 className="text-[20px] leading-[30px] text-headingColor font-semibold flex items-center gap-2">
          About <span className="text-irisBlueColor font-bold text-[24px] leading-9">{doctor.name}</span>
        </h3>
        <p className="text_para">{doctor.about || "No bio available."}</p>
      </div>

      {/* Education Section */}
      <div className="mt-5">
        <h3 className="text-[20px] leading-[30px] text-headingColor font-semibold">Education</h3>
        <ul className="pt-4 md:p-5">
          {doctor.qualifications?.map((qualification, index) => (
            <li key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-end md:gap-5 mb-[30px]">
              <div>
                <p className="text-[16px] leading-6 font-medium text-textColor">
                  {qualification}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Experience Section */}
      <div className="mt-12">
        <h3 className="text-[20px] leading-[30px] text-headingColor font-semibold">Experience</h3>
        <ul className="grid sm:grid-cols-2 gap-[30px] pt-4 md:p-5">
          {doctor.experiences?.map((experience, index) => (
            <li key={index} className="p-4 rounded bg-[#fff9ea]">
              <p className="text-[16px] leading-6 font-medium text-textColor">
                {experience}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DoctorAbout;

