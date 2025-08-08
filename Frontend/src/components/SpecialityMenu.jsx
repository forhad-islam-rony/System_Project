import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
  return (
    <div id='speciality' className='flex flex-col items-center gap-4 py-16 text-gray-800 container mt-[-80px]'>
        <h1 className='heading text-center'>Find by Speciality</h1>
        <p className='sm:w-1/2 text-center text_para'>Easily explore our comprehensive list of medical specialties and find expert doctors tailored to your specific healthcare needs.</p>
        <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll'>
          {specialityData.map((item, index) => (
            <Link className='flex flex-col items-center text-xs cursor-pointer flex-shirnk-0 hover:translate-y-[-10px] translate-all duration-500' key={index} to={`/doctors?specialization=${encodeURIComponent(item.speciality)}`}>
              <img className='w-16 sm:w-24 mb-2' src={item.image} alt={item.speciality} />
              <p className='text-[15px] font-[600] text-textColor'>{item.speciality}</p>
              </Link>
            ))}
        </div>
    </div>
  )
}

export default SpecialityMenu