import React from 'react'
import {doctors} from '../assets/data/doctors.js'

const TopDoctors = () => {
  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
        <h1 className='text-3xl font-medium'>Top doctors to book</h1>
        <p className='sm: w-1/3 text-center text-sm'>Simply browse through our trusted doctors</p>
        <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
            {doctors.slice(0, 3).map((item, index) => (
                <div className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>
                    <img className='bg-blue-50' src={item.photo} alt={item.name} />
                    <div className='p-4 '>
                        <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                            <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                        </div>
                        <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                        <p className='text-grey-600 text-sm'>{item.speciality}</p>
                    </div>
                </div>
            ))}
        </div>
        <button className='bg-blue-500 text-white px-4 py-2 rounded-md mt-5 hover:bg-blue-600 transition-all duration-300'>View all doctors</button>
    </div>
  )
}

export default TopDoctors