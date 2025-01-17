import React from 'react';
import { FaUserMd, FaCalendarCheck, FaStar, FaChartLine } from 'react-icons/fa';

const Statistics = () => {
  return (
    <div>
      <h2 className="text-[24px] leading-9 font-bold text-headingColor mb-6">
        Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="p-6 bg-[#CCF0F3] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[18px] leading-7 font-bold text-headingColor mb-1">
                Total Patients
              </h4>
              <span className="text-[28px] leading-9 font-bold text-irisBlueColor">
                485
              </span>
            </div>
            <FaUserMd className="text-4xl text-primaryColor" />
          </div>
        </div>

        <div className="p-6 bg-[#FFF9EA] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[18px] leading-7 font-bold text-headingColor mb-1">
                Appointments
              </h4>
              <span className="text-[28px] leading-9 font-bold text-yellowColor">
                32
              </span>
            </div>
            <FaCalendarCheck className="text-4xl text-yellowColor" />
          </div>
        </div>

        <div className="p-6 bg-[#FEF0EF] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[18px] leading-7 font-bold text-headingColor mb-1">
                Rating
              </h4>
              <span className="text-[28px] leading-9 font-bold text-[#FF0000]">
                4.8
              </span>
            </div>
            <FaStar className="text-4xl text-[#FF0000]" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-[20px] leading-8 font-bold text-headingColor mb-4">
          Recent Activity
        </h3>
        <div className="bg-[#F8F9FA] p-4 rounded-lg">
          {/* Add recent activities list here */}
        </div>
      </div>
    </div>
  );
};

export default Statistics; 