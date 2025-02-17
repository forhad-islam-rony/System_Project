import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
  createPost,
  updatePost,
  deletePost,
  getUserPosts,
  getAllPosts,
  getPostById,
  likePost,
  addComment,
  removeComment,
  reportPost,
  approvePost,
  rejectPost
} from '../Controllers/postController.js';

const router = express.Router();

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes
router.use(authenticate);
router.post('/', createPost);
router.get('/user/posts', getUserPosts);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/comment', addComment);
router.delete('/:id/comment/:commentId', removeComment);
router.post('/:id/report', reportPost);

// Admin routes
router.put('/:id/approve', approvePost);
router.put('/:id/reject', rejectPost);

export default router; 