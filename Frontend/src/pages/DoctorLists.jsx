import React, { useState, useEffect } from 'react'
import DoctorCard from './DoctorCard'
import { BASE_URL } from '../config'
import HashLoader from 'react-spinners/HashLoader'

const DoctorLists = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${BASE_URL}/doctors/top-rated`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctors')
        }

        const result = await response.json()
        
        if (result.success) {
          // Get only the top 3 doctors
          setDoctors(result.data.slice(0, 3))
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching top doctors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopDoctors()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-[200px]">
        <HashLoader color="#3d4db5" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-[200px]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-[30px] mt-[30px] lg:mt-[55px]">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor._id} doctor={doctor} />
      ))}
    </div>
  )
}

export default DoctorLists