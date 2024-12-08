import React from 'react'
import FaqItems from './FaqItems'
import {faqs} from './../assets/data/faqs'

const Faq = () => {
  return (
    <ul className='mt-[38px]'>
     {faqs.map((item, index) => <FaqItems key={index} item={item} />)}
    </ul>
  )
}

export default Faq