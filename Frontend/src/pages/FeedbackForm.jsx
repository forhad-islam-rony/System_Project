import React from "react";
import { AiFillStar } from "react-icons/ai";

const FeedbackForm = () => {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [reviewText, setReviewText] = React.useState("");

  return (
    <form action="">
      <div>
        <h3
          className=" text-headingColor
            text-[16px] leading-6 mb-4
            font-semibold"
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
                } bg-transparent border-none outline-none
                    text-[22px] cursor-pointer`}
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
          className=" text-headingColor
            text-[16px] leading-6 mb-4
            font-semibold mt-0"
        >
            Write a review
        </h3>
        <textarea
          className="border border-solid border-[#OO66ff34]
          focus:outline outline-primaryColor w-full px-4 py-3
          rounder-md"
          rows="5"
          placeholder="Write your review here..."
          onChange={()=>setReviewText(e.target.value)}
        >
        </textarea>
      </div>

      <button type="submit" className="btn">
        Submit Feedback
      </button>

    </form>
  );
};

export default FeedbackForm;
