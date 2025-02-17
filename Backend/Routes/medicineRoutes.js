import express from 'express';
import { getAllMedicines, getMedicineById, createMedicine } from '../controllers/medicineController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

router.get('/', getAllMedicines);  // Public route to get all medicines
router.get('/:id', getMedicineById);  // Add this route
router.post('/', authenticate, restrict(['admin']), createMedicine);

export default router; 