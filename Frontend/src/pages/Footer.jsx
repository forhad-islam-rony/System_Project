import React from 'react'
import {Link} from 'react-router-dom'
import {RiLinkedinFill} from 'react-icons/ri'
import { AiFillYoutube, AiFillGithub, AiOutlineInstagram } from 'react-icons/ai'
import { FaHospital } from 'react-icons/fa'

const socialLinks = [
  {
    path: 'https://www.youtube.com/',
    icon: <AiFillYoutube className='group-hover:text-white w-4 h-5' />
  },
  {
    path: 'https://github.com/',
    icon: <AiFillGithub className='group-hover:text-white w-4 h-5' />
  },
  {
    path: 'https://www.instagram.com/',
    icon: <AiOutlineInstagram className='group-hover:text-white w-4 h-5' />
  },
  {
    path: 'https://www.linkedin.com/',
    icon: <RiLinkedinFill className='group-hover:text-white w-4 h-5' />
  },
];

const quickLinks01 = [
  {
    path: '/',
    display: "Home",
  },
  {
    path: '/about',
    display: "Services",
  },
  {
    path: '/contact',
    display: "Contact",
  },
];
const quickLinks02 = [
  {
    path: '/doctors',
    display: "Find a Doctor",
  },
  {
    path: '/doctors',
    display: "Request an Appointment",
  },
  {
    path: '/ambulance',
    display: "Find an Ambulance",
  },
  {
    path: '/medical-chatbot',
    display: "Online Health Checkup",
  },
];

const quickLinks03 = [
  {
    path: '/contact',
    display: "Contact Us",
  },
  {
    path: '/about',
    display: "About Us",
  },
  {
    path: '/review',
    display: "Review Us",
  },
  {
    path: '/blogs',
    display: "Health Blog",
  },
];


const Footer = () => {
  const year = new Date().getFullYear()

  return (
  <footer className='pb-16 pt-10'>
    <div className='container'>
       <div className='flex justify-between flex-col md:flex-row flex-wrap gap-[30px]'>
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <FaHospital className="text-primaryColor text-[24px]" />
            <span className="text-[24px] font-[700] text-headingColor">
              Next<span className="text-primaryColor">Health</span>
            </span>
          </Link>
          <p className='text-[16px] leading-7 font-[400] text-textColor'>Copyright © {year} developed by Forhad Islam Rony & Ekramul Alam. All rights reserved.</p>

          <div className='flex items-center gap-3 mt-4'>
            {socialLinks.map((link, index) => (
              <a 
                href={link.path} 
                key={index} 
                target="_blank" 
                rel="noopener noreferrer" 
                className='w-9 h-9 border border-solid border-[#181A1E] rounded-full flex items-center justify-center group hover:bg-primaryColor hover:border-none'
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className='text-[20px] leading-[30px] font-[700] mb-6 text-headingColor'>
            Quick Links
          </h2>

          <ul>
            {quickLinks01.map((item,index) => (
              <li key={index} className='mb-4'>
                <Link to={item.path} className='text-[16px] leading-7 font-[400] text-textColor hover:text-primaryColor'>{item.display}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className='text-[20px] leading-[30px] font-[700] mb-6 text-headingColor'>
            I want to:
          </h2>

          <ul>
            {quickLinks02.map((item,index) => (
              <li key={index} className='mb-4'>
                <Link to={item.path} className='text-[16px] leading-7 font-[400] text-textColor hover:text-primaryColor'>{item.display}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className='text-[20px] leading-[30px] font-[700] mb-6 text-headingColor'>
            Support
          </h2>

          <ul>
            {quickLinks03.map((item,index) => (
              <li key={index} className='mb-4'>
                <Link to={item.path} className='text-[16px] leading-7 font-[400] text-textColor hover:text-primaryColor'>{item.display}</Link>
              </li>
            ))}
          </ul>
        </div>

       </div>
    </div>
  </footer>
  )
}

export default Footer