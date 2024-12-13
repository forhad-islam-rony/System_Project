
import express from "express";

import { getSingleDoctor, getAllDoctor, updateDoctor, deleteDoctor, getDoctorProfile } from "../Controllers/doctorController.js";

import { authenticate, restrict } from "../auth/verifyToken.js";

import reviewRoute from "./review.js";

const DoctorRoute = express.Router();

DoctorRoute.use('/:doctorId/reviews', reviewRoute);

DoctorRoute.get('/:id',  getSingleDoctor);
DoctorRoute.get('/', getAllDoctor);
DoctorRoute.put('/:id', authenticate, restrict(["doctor"]), updateDoctor);
DoctorRoute.delete('/:id', authenticate, restrict(["doctor"]), deleteDoctor);

DoctorRoute.get('/profile/me', authenticate, restrict(["doctor"]), getDoctorProfile);

export default DoctorRoute;