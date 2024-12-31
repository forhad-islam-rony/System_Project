import React from 'react'
import heroImg01 from '../assets/images/hero-img01.png'
import heroImg02 from '../assets/images/hero-img02.png'
import heroImg03 from '../assets/images/hero-img03.png'
import icon01 from '../assets/images/icon01.png'
import icon02 from '../assets/images/icon02.png'
import icon03 from '../assets/images/icon03.png'
import { Link } from 'react-router-dom'
import { BsArrowRight } from 'react-icons/bs'
import SpecialityMenu from '../components/SpecialityMenu'
import DoctorLists from './DoctorLists'
import faqImg from '../assets/images/faq-img.png'
import Faq from './Faq'
import Testimonial from './Testimonial'
import Footer from './Footer'

const Home = () => {
  return <>
  {/* Hero Section */}
  
  <section className="hero_section pt-[60px] 2xl:h-[800px]">
  <div className="container">
    <div className="flex flex-col lg:flex-row gap-[90px] items-center justify-between">
      {/* Hero Content */}
      <div>
      <div className="lg:w-[570px]"> {/* Aligns content to the left */}
        <h1 className="text-[36px] leading-[46px] text-headingColor font-[800] md:text-[60px] md:leading-[70px]">
          Transforming Lives Through Quality <span className='healthcare'>Healthcare.</span>
        </h1>
        <p className='text_para'>
        Empowering health in Bangladesh with innovative, accessible medical solutions, connecting patients to top healthcare providers for better, healthier lives.
        </p>
        <button className='btn hover:scale-105 transition-all duration-300'>Request an Appointment</button>
      </div>
      {/* Hero Counter */}
      <div className='mt-[30px] lg:mt-[70px] flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-[30px]'>
        <div>
        <h2 className='text-[36px] leading-[56px] lg:text-[44px] lg:leading-[54px] font-[700] text-headingColor'>10+</h2>
        <span className='w-[100px] h-2 bg-yellowColor rounded full block mt-[-14px]'></span>
        <p className='text_para'>Years of Experience</p>
        </div>
        <div>
        <h2 className='text-[36px] leading-[56px] lg:text-[44px] lg:leading-[54px] font-[700] text-headingColor'>35+</h2>
        <span className='w-[100px] h-2 bg-purpleColor rounded full block mt-[-14px]'></span>
        <p className='text_para'>Clinic Location</p>
        </div>
        <div>
        <h2 className='text-[36px] leading-[56px] lg:text-[44px] lg:leading-[54px] font-[700] text-headingColor'>100%</h2>
        <span className='w-[100px] h-2 bg-irisBlueColor rounded full block mt-[-14px]'></span>
        <p className='text_para'>Patient Satisfaction</p>
        </div>
      </div>
    </div>
    {/* Heor Content */}
    <div className="flex gap-[30px] justify-end">
      <div>
        <img className='w-full' src={heroImg01} alt="Hero Image"/>
      </div>
      <div className='mt-[30px]'>
        <img className='w-full mb[30px]' src={heroImg02} alt="Hero Image2" />
        <img className='w-full' src={heroImg03} alt="Hero Image3" />
      </div>
    </div>
  </div>
  </div>
</section>

<section>
  <div className="container">
    <div className='lg:w-[470px] mx-auto'>
      <h2 className='heading text-center'>Providing the best medical services</h2>
     <p className='text-para text-center'>Connecting Bangladesh with advanced healthcare solutions, fostering well-being through quality medical services and compassionate care.</p>
    </div>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[30px] lg:mt-[55px]">

      <div className='py-[30px] px-5'>
        <div className='flex items-center justify-center'>
          <img src={icon01} alt="" />
        </div>
       <div className='mt-[30px]'>
        <h2 className='text-[26px] leading-9 text-headingColor font-[700] text-center'>Find a Doctor</h2>
        <p className='text_para text-center leading-7 text-textColor font-[400] mt-4'>Find expert doctors across Bangladesh, compare specialties, and book appointments with ease for personalized, quality care</p>

        <Link to='/doctors' className='w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] mt-[20px] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none'>
        <BsArrowRight className='group-hover:text-white w-6 h-5' />
        </Link>
       </div>
      </div>
      <div className='py-[30px] px-5'>
        <div className='flex items-center justify-center'>
          <img src={icon02} alt="" />
        </div>
       <div className='mt-[30px]'>
        <h2 className='text-[26px] leading-9 text-headingColor font-[700] text-center'>Find an Ambulance</h2>
        <p className='text_para text-center leading-7 text-textColor font-[400] mt-4'>Get access to reliable ambulance services in Bangladesh, book instantly for emergencies, and ensure timely medical transport.</p>

        <Link to='/doctors' className='w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] mt-[20px] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none'>
        <BsArrowRight className='group-hover:text-white w-6 h-5' />
        </Link>
       </div>
      </div>
      <div className='py-[30px] px-5'>
        <div className='flex items-center justify-center'>
          <img src={icon03} alt="" />
        </div>
       <div className='mt-[30px]'>
        <h2 className='text-[26px] leading-9 text-headingColor font-[700] text-center'>Online Health Checkup</h2>
        <p className='text_para text-center leading-7 text-textColor font-[400] mt-4'>Get personalized health assessments with AI-driven chatbots, detect potential diseases online, and stay proactive about your well-being.</p>

        <Link to='/doctors' className='w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] mt-[20px] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none'>
        <BsArrowRight className='group-hover:text-white w-6 h-5' />
        </Link>
       </div>
      </div>
     </div>
  </div>
</section>
 {/* SpecialityMenu Section */}
  <SpecialityMenu />

  {/* Best Doctor List */}

 <section>
 <div className="container">
    <div className='xl:w-[470px] mx-auto'>
      <h2 className='heading text-center'>
        Our great Doctors
      </h2>
      <p className='text_para text-center'>
      Discover our team of exceptional doctors, dedicated to providing top-quality care and personalized treatments across Bangladesh.
      </p>
    </div>
    <DoctorLists />
    </div>
 </section>
{/* Faq Section */}

<section>
  <div className="container">
    <div className='flex justify-between gap-[50px] lg:gap-0'>
      <div className='w-1/2 hidden md:block'>
      <img src={faqImg} alt="" />
      </div>
     
     <div className='w-full md:w-1/2'>
     <h2 className='heading'>Most questions by out beloved patients</h2>

      <Faq />
     </div>

    </div>
  </div>
</section>

{/* testimonial */}
<section>
  <div className='container'>
    <div className='xl:w-[470px] mx-auto'>
      <h2 className='heading text-center'>What our patient say</h2>
      <p className='text_para text-center'>
      Hear from our patients as they share their experiences, showcasing the exceptional care and personalized attention they received on their journey to better health
      </p>
    </div>

    <Testimonial />
  </div>
  </section>

  {/* Footer */}
  
  </>
  
}

export default Home