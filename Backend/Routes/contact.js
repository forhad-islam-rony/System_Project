import express from 'express';
import { 
  createContact, 
  getAllContacts, 
  updateContactStatus 
} from '../Controllers/contactController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/', createContact);

// Admin routes
router.use(verifyAdmin);
router.get('/', getAllContacts);
router.patch('/:id/status', updateContactStatus);

export default router; 