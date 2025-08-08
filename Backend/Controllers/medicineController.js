import Medicine from '../models/Medicine.js';

// Standardized medicine categories
export const medicineCategories = [
    "Pain & Fever",
    "Cold & Flu",
    "Vitamins & Supplements",
    "Diabetes Care",
    "Heart & BP",
    "Skin Care",
    "Baby Care",
    "First Aid"
];

// Get all medicines
export const getAllMedicines = async (req, res) => {
    try {
        console.log('Fetching medicines...'); // Debug log
        
        const medicines = await Medicine.find().sort({ createdAt: -1 });
        console.log('Found medicines:', medicines.length); // Debug log
        
        res.status(200).json({
            success: true,
            message: 'Medicines fetched successfully',
            data: medicines
        });
    } catch (error) {
        console.error('Error in getAllMedicines:', error); // Debug log
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch medicines'
        });
    }
};

// Create new medicine
export const createMedicine = async (req, res) => {
    try {
        const newMedicine = new Medicine(req.body);
        const savedMedicine = await newMedicine.save();
        
        res.status(201).json({
            success: true,
            message: 'Medicine created successfully',
            data: savedMedicine
        });
    } catch (error) {
        console.error('Error creating medicine:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create medicine'
        });
    }
};

// Delete medicine
export const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        
        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medicine deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete medicine'
        });
    }
};

// Get medicine by ID
// Get all medicine categories
export const getMedicineCategories = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Medicine categories fetched successfully',
            data: medicineCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch medicine categories'
        });
    }
};

export const getMedicineById = async (req, res) => {
    try {
        const { id } = req.params;
        const medicine = await Medicine.findById(id);
        
        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medicine fetched successfully',
            data: medicine
        });
    } catch (error) {
        console.error('Error in getMedicineById:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch medicine details'
        });
    }
}; 