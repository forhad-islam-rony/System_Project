import express from "express";

import { getAllReviews, createReview } from "../Controllers/reviewController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const reviewRoute = express.Router({mergeParams: true});

reviewRoute.route('/').get(getAllReviews).post(authenticate, restrict(["patient"]), createReview);

export default reviewRoute;