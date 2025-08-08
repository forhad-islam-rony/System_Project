import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide} from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import patientAvatar from '../assets/images/patient-avatar.png'
import {HiStar} from 'react-icons/hi'
import { BASE_URL } from '../config'

const Testimonial = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch platform reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${BASE_URL}/reviews/platform`)
        const result = await res.json()
        
        if (res.ok && result.success) {
          setReviews(result.data)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Function to render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <HiStar 
        key={index}
        className={`w-[18px] h-5 ${
          index < rating ? 'text-yellowColor' : 'text-gray-300'
        }`} 
      />
    ))
  }

  // Default testimonials if no reviews are available
  const defaultTestimonials = [
    {
      _id: 'default1',
      patientName: 'Forhad Islam',
      patientPhoto: patientAvatar,
      rating: 5,
      reviewText: "I've been using the medical services on this website, and I'm really impressed. The information is clear, accurate, and easy to access. It's reassuring to know that reliable medical advice is just a few clicks away. The overall user experience is seamless, and I appreciate how quickly I can find what I need. Highly recommend this service to anyone looking for trusted medical resources online. Keep up the great work!"
    },
    {
      _id: 'default2',
      patientName: 'Sarah Ahmed',
      patientPhoto: patientAvatar,
      rating: 5,
      reviewText: "Excellent healthcare platform! The doctors are professional, and the appointment booking system is very convenient. I was able to get the medical help I needed quickly and efficiently."
    },
    {
      _id: 'default3',
      patientName: 'Mohammad Rahman',
      patientPhoto: patientAvatar,
      rating: 4,
      reviewText: "Great service overall. The ambulance booking feature saved me during an emergency. The response time was quick and the medical staff was professional. Highly recommended!"
    }
  ]

  // Combine real reviews with default ones if needed
  const displayReviews = reviews.length > 0 ? reviews : defaultTestimonials
  if (loading) {
    return (
      <div className='mt-[30px] lg:mt-[55px] text-center'>
        <p className='text-textColor'>Loading reviews...</p>
      </div>
    )
  }

  return (
    <div className='mt-[30px] lg:mt-[55px]'>
      <Swiper 
        modules={[Pagination]} 
        spaceBetween={30} 
        slidesPerView={1} 
        pagination={{clickable:true}} 
        breakpoints={{
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
        }}
      >
        {displayReviews.map((review) => (
          <SwiperSlide key={review._id}>
            <div className='py-[30px] px-5 rounded-[13px] bg-white shadow-md h-full'>
              <div className='flex items-center gap-[13px]'>
                <div className='w-[60px] h-[60px] rounded-full overflow-hidden'>
                  <img 
                    src={review.patientPhoto || patientAvatar} 
                    alt={review.patientName} 
                    className='w-full h-full object-cover'
                  />
                </div>
                <div>
                  <h4 className='text-[18px] leading-[30px] font-semibold text-headingColor'>
                    {review.patientName || review.user?.name || 'Anonymous Patient'}
                  </h4>
                  <div className='flex items-center gap-[2px]'>
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
              <p className='text-[16px] leading-7 mt-4 text-textColor font-[400]'>
                {review.reviewText}
              </p>
              {review.createdAt && (
                <p className='text-[12px] text-gray-400 mt-2'>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default Testimonial