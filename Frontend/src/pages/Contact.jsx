import React, { useState } from 'react';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Message sent successfully');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className='px-4 mx-auto max-w-screen-md'>
        <h2 className='heading text-center'>Contact Us</h2>
        <p className='mb-8 lg:mb-16 font-light text-center text_para'>
          Get in touch with us for any inquiries, support, or feedback. We're here to assist you 24/7!
        </p>

        <form onSubmit={handleSubmit} className='space-y-8'>
          <div>
            <label htmlFor="name" className='form_label'>Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder='Enter your name'
              className='form_input mt-1'
              required
            />
          </div>
          <div>
            <label htmlFor="email" className='form_label'>Your Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder='example@gmail.com'
              className='form_input mt-1'
              required
            />
          </div>
          <div>
            <label htmlFor="subject" className='form_label'>Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder='Let us know how we can help you'
              className='form_input mt-1'
              required
            />
          </div>

          <div className='sm:col-span-2'>
            <label htmlFor="message" className='form_label'>Your Message</label>
            <textarea
              rows="6"
              type="text"
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder='Leave a comment....'
              className='form_input mt-1'
              required
            />
          </div>
          <button
            type='submit'
            className='btn rounded sm:w-fit'
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;