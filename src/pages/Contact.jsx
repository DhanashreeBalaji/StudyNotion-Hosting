import React from 'react'
import Footer from "../components/common/Footer"
import ContactDetails from "../components/core/ContactPage/ContactDetails"
import ContactForm from "../components/core/ContactPage/ContactForm"

const Contact = () => {
  return (
    <div>

     <div className='mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col
     justify-between gap-10'>
     {/* Contact Details */}
     <div className="lg:w-[40%]">
       <ContactDetails/>
     </div>
      
      {/* Contact Form */}
      <div>
        <ContactForm/>
      </div>
     </div>

     <div className='relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col
     items-center justify-between'>
       {/* Reviews from other Learners */}
       <h1 className='text-center text-4xl font-semibold mt-8'>
        Reviews from other learners
       </h1>
       {/* Review Slider */}
     </div>

     <Footer/>
    </div>
  )
}

export default Contact