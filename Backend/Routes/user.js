
import express from "express";

import { getSingleUser, getAllUser, updateUser, deleteUser } from "../Controllers/userController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";


const userRoute = express.Router();

userRoute.get('/:id', authenticate, restrict(["patient"]),
getSingleUser);
userRoute.get('/', authenticate, restrict(["admin"]), getAllUser);
userRoute.put('/:id', authenticate, restrict(["patient"]), updateUser);
userRoute.delete('/:id', authenticate, restrict(["patient"]), deleteUser);

export default userRoute;