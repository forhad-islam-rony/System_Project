import express from 'express';
import { getAllMedicines, getMedicineById, createMedicine, getMedicineCategories } from '../Controllers/medicineController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

router.get('/', getAllMedicines);  // Public route to get all medicines
router.get('/categories', getMedicineCategories);  // Get all medicine categories
router.get('/:id', getMedicineById);  // Get medicine by ID
router.post('/', authenticate, restrict(['admin']), createMedicine);

export default router; 