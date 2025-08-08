/**
 * @fileoverview Review Page Component
 * @description Allows patients to submit reviews and ratings for the healthcare system
 * @author Healthcare System Team
 * @version 1.0.0
 */

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

/**
 * ReviewPage component for patient feedback
 * @component
 * @returns {JSX.Element} Review submission form with star rating
 */
const ReviewPage = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  /**
   * Handle review submission
   * @async
   * @function handleSubmit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/reviews/platform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          reviewText: reviewText.trim(),
          patientName: user.name,
          patientPhoto: user.photo
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Thank you for your review!');
      setRating(0);
      setReviewText('');
      
      // Navigate back to home page after successful submission
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
      console.error('Review submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle star rating click
   * @function handleRatingClick
   * @param {number} value - Selected rating value
   */
  const handleRatingClick = (value) => {
    setRating(value);
  };

  /**
   * Handle star hover
   * @function handleRatingHover
   * @param {number} value - Hovered rating value
   */
  const handleRatingHover = (value) => {
    setHoveredRating(value);
  };

  /**
   * Handle mouse leave from stars
   * @function handleRatingLeave
   */
  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-headingColor mb-4">
              Share Your Experience
            </h1>
            <p className="text-textColor text-lg">
              Your feedback helps us improve our healthcare services and helps other patients make informed decisions.
            </p>
          </div>

          {/* Review Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div>
                <label className="block text-headingColor font-semibold text-lg mb-4">
                  Rate Your Experience
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => handleRatingHover(star)}
                      onMouseLeave={handleRatingLeave}
                      className="transition-colors duration-200 focus:outline-none"
                    >
                      <FaStar
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-textColor">
                  {rating === 0 && 'Click to rate your experience'}
                  {rating === 1 && 'Poor - Very dissatisfied'}
                  {rating === 2 && 'Fair - Somewhat dissatisfied'}
                  {rating === 3 && 'Good - Neutral experience'}
                  {rating === 4 && 'Very Good - Satisfied'}
                  {rating === 5 && 'Excellent - Highly satisfied'}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <label htmlFor="reviewText" className="block text-headingColor font-semibold text-lg mb-4">
                  Tell Us About Your Experience
                </label>
                <textarea
                  id="reviewText"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-transparent resize-none"
                  placeholder="Share details about your experience with our healthcare services. What did you like? How can we improve?"
                  maxLength="500"
                ></textarea>
                <div className="text-right text-sm text-textColor mt-2">
                  {reviewText.length}/500 characters
                </div>
              </div>

              {/* User Info Display */}
              {user && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-textColor mb-2">
                    Reviewing as:
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primaryColor flex items-center justify-center">
                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-headingColor">
                      {user.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 px-6 border border-gray-300 text-textColor rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || rating === 0 || !reviewText.trim()}
                  className="flex-1 py-3 px-6 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>

          {/* Login Prompt for Non-Authenticated Users */}
          {!user && (
            <div className="mt-8 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Login Required
                </h3>
                <p className="text-yellow-700 mb-4">
                  You need to be logged in to submit a review.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primaryColor text-white px-6 py-2 rounded-lg hover:bg-primaryColor/90 transition-colors duration-200"
                >
                  Login to Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
