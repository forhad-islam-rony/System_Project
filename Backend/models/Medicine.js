import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    genericName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    dosageMg: {
        type: Number,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    description: {
        text: {
            type: String,
            required: true
        },
        keyBenefits: {
            type: String,
            required: true
        },
        recommendedFor: {
            type: String,
            required: true
        }
    },
    usageInstruction: {
        type: String,
        required: true
    },
    sideEffects: {
        type: String,
        required: true
    },
    storage: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Medicine', medicineSchema); 