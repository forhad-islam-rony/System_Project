import express from 'express';
import { login, register, searchBloodDonors } from '../Controllers/authController.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/blood-donors', searchBloodDonors);

export default router;