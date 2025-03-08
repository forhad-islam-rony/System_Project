import React, { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { BASE_URL, token } from "../config";
import { toast } from "react-hot-toast";

const FeedbackForm = ({doctorId, onSubmitSuccess}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async e => {
    e.preventDefault();
    
    if(!rating || !reviewText) {
      return toast.error('Rating & Review text fields are required');
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          reviewText,
          doctor: doctorId
        })
      });

      const result = await res.json();
      
      if(!res.ok) {
        throw new Error(result.message);
      }

      toast.success(result.message);
      
      // Call the callback with the new review
      if (onSubmitSuccess) {
        onSubmitSuccess(result.data, result.doctor);
      }

      // Reset form
      setRating(0);
      setReviewText('');
      setHover(0);

    } catch(err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e) => {
    setReviewText(e.target.value);
  };

  return (
    <form onSubmit={handleSubmitReview}>
      <div>
        <h3
          className="text-headingColor text-[16px] leading-6 mb-4 font-semibold"
        >
          How would you rate the overall experience?
        </h3>
        <div>
          {[...Array(5).keys()].map((_, index) => {
            index += 1;
            return (
              <button
                key={index}
                type="button"
                className={`${
                  index <= ((rating && hover) || hover)
                    ? "text-yellowColor"
                    : "text-gray-400"
                } bg-transparent border-none outline-none text-[22px] cursor-pointer`}
                onClick={() => setRating(index)}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(rating)}
                onDoubleClick={() => {
                  setHover(0);
                  setRating(0);
                }}
              >
                <span>
                  <AiFillStar />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-[30px]">
        <h3
          className="text-headingColor text-[16px] leading-6 mb-4 font-semibold mt-0"
        >
          Write a review
        </h3>
        <textarea
          className="border border-solid border-[#0066ff34] focus:outline outline-primaryColor w-full px-4 py-3 rounded-md"
          rows="5"
          placeholder="Write your review here..."
          value={reviewText}
          onChange={handleTextChange}
        />
      </div>

      <button 
        type="submit" 
        className="btn mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

export default FeedbackForm;
