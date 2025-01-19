import React from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight } from 'react-icons/bs';
import { FaAmbulance, FaUserMd, FaHospital, FaTint } from 'react-icons/fa';
import { RiMentalHealthFill } from 'react-icons/ri';
import { GiMedicines } from 'react-icons/gi';

const About = () => {
  const services = [
    {
      icon: <FaUserMd className="text-4xl text-primaryColor" />,
      title: "Find a Doctor",
      description: "Connect with specialized doctors across Bangladesh. Book appointments easily and get quality healthcare.",
      link: "/doctors"
    },
    {
      icon: <FaAmbulance className="text-4xl text-primaryColor" />,
      title: "Ambulance Service",
      description: "24/7 emergency ambulance service. Quick response time and professional medical transport.",
      link: "/ambulance"
    },
    {
      icon: <FaTint className="text-4xl text-primaryColor" />,
      title: "Find Blood Group",
      description: "Search for blood donors near you. Connect with willing donors in emergency situations.",
      link: "/blood-group"
    },
    {
      icon: <RiMentalHealthFill className="text-4xl text-primaryColor" />,
      title: "Mental Health",
      description: "Online counseling and mental health support from experienced professionals.",
      link: "/mental-health"
    },
    {
      icon: <GiMedicines className="text-4xl text-primaryColor" />,
      title: "Medicine Delivery",
      description: "Order prescribed medicines online and get them delivered to your doorstep.",
      link: "/medicine"
    },
    {
      icon: <FaHospital className="text-4xl text-primaryColor" />,
      title: "Find Hospitals",
      description: "Locate nearby hospitals and healthcare facilities with available services.",
      link: "/hospitals"
    }
  ];

  return (
    <section className="pt-[60px] pb-[60px] bg-[#f5f5f5]">
      <div className="container">
        <div className="xl:w-[470px] mx-auto">
          <h2 className="heading text-center">Our Medical Services</h2>
          <p className="text_para text-center">
            Comprehensive healthcare solutions designed to meet all your medical needs with professional care and support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-[30px]">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-[20px] shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="flex items-center justify-center w-[60px] h-[60px] rounded-full bg-[#CCF0F3] mb-[20px] mx-auto">
                {service.icon}
              </div>
              <div className="text-center">
                <h3 className="text-[22px] leading-9 text-headingColor font-[700] mb-4">
                  {service.title}
                </h3>
                <p className="text-[16px] leading-7 text-textColor font-[400] mb-6">
                  {service.description}
                </p>
                <Link
                  to={service.link}
                  className="w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none"
                >
                  <BsArrowRight className="group-hover:text-white w-6 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;