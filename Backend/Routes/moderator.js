import express from 'express';
import { 
  login, 
  getPendingPosts, 
  approvePost, 
  rejectPost,
  getStats,
  getRecentPosts
} from '../Controllers/moderatorController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.use(authenticate);
router.get('/pending-posts', getPendingPosts);
router.put('/posts/:id/approve', approvePost);
router.put('/posts/:id/reject', rejectPost);
router.get('/stats', getStats);
router.get('/recent-posts', getRecentPosts);

export default router; 