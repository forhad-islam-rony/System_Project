import React, { useState, useEffect, useContext } from "react";
import { BASE_URL, token } from "../config";
import avatar from "../assets/images/avatar-icon.png";
import { formateDate } from "../utils/formateDate";
import { AiFillStar } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import FeedbackForm from "./FeedbackForm";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const Feedback = ({ doctorId, onReviewSubmit }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorId}/reviews`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setReviews(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!doctorId) return;
    fetchReviews();
  }, [doctorId]);

  const handleReviewSubmit = async (newReview, doctorData) => {
    // Create a complete review object with user data
    const completeReview = {
      ...newReview,
      user: {
        name: user.name,
        photo: user.photo,
        _id: user._id
      },
      createdAt: new Date().toISOString()
    };
    
    setReviews([...reviews, completeReview]);
    setShowFeedbackForm(false);
    
    // Call parent callback with updated doctor data
    if (onReviewSubmit && doctorData) {
      onReviewSubmit(doctorData);
    } else {
      // Fallback to just triggering a refresh
      onReviewSubmit();
    }
  };

  const confirmDeleteReview = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setReviewToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    setDeleting(true);
    
    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorId}/reviews/${reviewToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message);
      }
      
      // Remove the deleted review from state
      setReviews(reviews.filter(review => review._id !== reviewToDelete));
      
      // Update doctor ratings
      if (onReviewSubmit && result.doctor) {
        onReviewSubmit(result.doctor);
      }
      
      toast.success("Review deleted successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  if (!doctorId) return <div>Loading...</div>;

  return (
    <div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center text-red-500 mb-4">
              <MdWarning className="text-3xl mr-2" />
              <h3 className="text-xl font-bold">Delete Review</h3>
            </div>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteReview}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center"
              >
                {deleting ? 'Deleting...' : 'Delete'}
                {deleting && (
                  <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-[50px]">
        <h4 className="text-[20px] leading-[30px] font-bold text-headingColor mb-[30px]">
          All reviews ({reviews.length})
        </h4>

        <div className="max-h-[350px] overflow-y-auto pr-5 custom-scrollbar">
          {reviews?.map((review, index) => (
            <div key={index} className="flex justify-between gap-10 mb-[30px]">
              <div className="flex gap-3">
                <figure className="w-10 h-10 rounded-full">
                  <img 
                    className="w-full h-full rounded-full object-cover"
                    src={review.user?.photo || avatar} 
                    alt="" 
                  />
                </figure>

                <div>
                  <h5 className="text-[16px] leading-6 text-primaryColor font-bold">
                    {review.user?.name}
                  </h5>
                  <p className="text-[14px] leading-6 text-textColor">
                    {formateDate(review.createdAt)}
                  </p>
                  <p className="text_para mt-3 font-medium text-[15px]">
                    {review.reviewText}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex gap-1">
                  {[...Array(5).keys()].map((_, index) => (
                    <AiFillStar 
                      key={index} 
                      color={index < review.rating ? "#0067FF" : "#gray-400"} 
                    />
                  ))}
                </div>
                
                {/* Show delete button only for user's own reviews */}
                {user && review.user && user._id === review.user._id && (
                  <button 
                    onClick={() => confirmDeleteReview(review._id)}
                    className="text-red-500 mt-2 flex items-center gap-1 text-[14px] hover:text-red-700 transition"
                  >
                    <FaTrash /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!showFeedbackForm && (
        <div className="text-center">
          <button className="btn" onClick={() => setShowFeedbackForm(true)}>
            Give Feedback
          </button>
        </div>
      )}

      {showFeedbackForm && (
        <FeedbackForm 
          doctorId={doctorId} 
          onSubmitSuccess={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default Feedback;
