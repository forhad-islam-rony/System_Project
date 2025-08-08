import express from "express";

import { getAllReviews, createReview, deleteReview, getPlatformReviews, createPlatformReview } from "../Controllers/reviewController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const reviewRoute = express.Router({mergeParams: true});

reviewRoute.route('/').get(getAllReviews).post(authenticate, restrict(["patient"]), createReview);

// Platform review routes
reviewRoute.route('/platform').get(getPlatformReviews).post(authenticate, restrict(["patient"]), createPlatformReview);

reviewRoute.route('/:id').delete(authenticate, deleteReview);

export default reviewRoute;