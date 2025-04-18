import mongoose from 'mongoose';

const ambulanceRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    emergencyType: {
        type: String,
        required: true
    },
    preferredHospital: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'completed'],
        default: 'pending'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AmbulanceDriver'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AmbulanceRequest', ambulanceRequestSchema); 