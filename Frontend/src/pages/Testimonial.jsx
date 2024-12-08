import React from 'react'
import { Swiper, SwiperSlide} from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import patientAvatar from '../assets/images/patient-avatar.png'
import {HiStar} from 'react-icons/hi'


const Testimonial = () => {
  return (
    <div className='mt-[30px] lg:mt-[55px]'>
      <Swiper modules={[Pagination]} spaceBetween={30} slidesPerView={1} pagination={{clickable:true}} breakpoints={{
        640: {
          slidesPerView: 1,
          spaceBetween: 0
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30
        }
      }}>
        <SwiperSlide>
          <div className='py-[30px] px-5 rounded-[13px]'>
            <div className='flex items-center gap-[13px]'>
              <img src={patientAvatar} alt="" />
              <div>
                <h4 className='text-[18px] leading-[30px] font-semibold text-headingColor'>Forhad Islam</h4>
                <div className='flex items-center gap-[2px]'>
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                </div>
              </div>
            </div>
            <p classname ='text-[16px] leading-7 mt-4 text-textColor font-[400]'>I’ve been using the medical services on this website, and I’m really impressed. The information is clear, accurate, and easy to access. It’s reassuring to know that reliable medical advice is just a few clicks away. The overall user experience is seamless, and I appreciate how quickly I can find what I need. Highly recommend this service to anyone looking for trusted medical resources online. Keep up the great work!</p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className='py-[30px] px-5 rounded-[13px]'>
            <div className='flex items-center gap-[13px]'>
              <img src={patientAvatar} alt="" />
              <div>
                <h4 className='text-[18px] leading-[30px] font-semibold text-headingColor'>Forhad Islam</h4>
                <div className='flex items-center gap-[2px]'>
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                </div>
              </div>
            </div>
            <p classname ='text-[16px] leading-7 mt-4 text-textColor font-[400]'>I’ve been using the medical services on this website, and I’m really impressed. The information is clear, accurate, and easy to access. It’s reassuring to know that reliable medical advice is just a few clicks away. The overall user experience is seamless, and I appreciate how quickly I can find what I need. Highly recommend this service to anyone looking for trusted medical resources online. Keep up the great work!</p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className='py-[30px] px-5 rounded-[13px]'>
            <div className='flex items-center gap-[13px]'>
              <img src={patientAvatar} alt="" />
              <div>
                <h4 className='text-[18px] leading-[30px] font-semibold text-headingColor'>Forhad Islam</h4>
                <div className='flex items-center gap-[2px]'>
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                </div>
              </div>
            </div>
            <p classname ='text-[16px] leading-7 mt-4 text-textColor font-[400]'>I’ve been using the medical services on this website, and I’m really impressed. The information is clear, accurate, and easy to access. It’s reassuring to know that reliable medical advice is just a few clicks away. The overall user experience is seamless, and I appreciate how quickly I can find what I need. Highly recommend this service to anyone looking for trusted medical resources online. Keep up the great work!</p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className='py-[30px] px-5 rounded-[13px]'>
            <div className='flex items-center gap-[13px]'>
              <img src={patientAvatar} alt="" />
              <div>
                <h4 className='text-[18px] leading-[30px] font-semibold text-headingColor'>Forhad Islam</h4>
                <div className='flex items-center gap-[2px]'>
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                 <HiStar className='text-yellowColor w-[18px] h-5' />
                </div>
              </div>
            </div>
            <p classname ='text-[16px] leading-7 mt-4 text-textColor font-[400]'>I’ve been using the medical services on this website, and I’m really impressed. The information is clear, accurate, and easy to access. It’s reassuring to know that reliable medical advice is just a few clicks away. The overall user experience is seamless, and I appreciate how quickly I can find what I need. Highly recommend this service to anyone looking for trusted medical resources online. Keep up the great work!</p>
          </div>
        </SwiperSlide>

      </Swiper>

    </div>
  )
}

export default Testimonial