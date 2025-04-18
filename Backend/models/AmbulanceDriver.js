import mongoose from 'mongoose';

const ambulanceDriverSchema = new mongoose.Schema({
    driverName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AmbulanceDriver', ambulanceDriverSchema); 