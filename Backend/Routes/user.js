import express from "express";

import { getSingleUser, getAllUser, updateUser, deleteUser,getUserProfile, getMyAppointments, getMyBookings, getBookingHistory } from "../Controllers/userController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";


const userRoute = express.Router();

userRoute.get('/:id', authenticate, restrict(["patient"]),
getSingleUser);
userRoute.get('/', authenticate, restrict(["admin"]), getAllUser);
userRoute.put('/:id', authenticate, restrict(["patient"]), updateUser);
userRoute.delete('/:id', authenticate, restrict(["patient"]), deleteUser);
userRoute.get('/profile/me', authenticate, restrict(["patient"]), getUserProfile);
userRoute.get('/appointments/my-bookings', authenticate, getMyBookings);
userRoute.get('/appointments/history', authenticate, getBookingHistory);

export default userRoute;