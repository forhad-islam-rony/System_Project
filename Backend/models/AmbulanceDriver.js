/**
 * @fileoverview Ambulance Driver Schema for Healthcare System
 * @description Defines the database schema for ambulance drivers including
 * personal details, location tracking, and availability status
 * @author Healthcare System Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

/**
 * MongoDB Schema for ambulance drivers
 * @typedef {Object} AmbulanceDriverSchema
 * @property {string} driverName - Driver's full name (required)
 * @property {string} phone - Contact phone number (required, unique)
 * @property {string} licenseNumber - Driver's license number (required, unique)
 * @property {string} address - Driver's residential address (required)
 * @property {string} location - Current location description (required)
 * @property {string} status - Driver's availability status (available/busy/offline)
 * @property {Date} createdAt - Account creation timestamp
 */
const ambulanceDriverSchema = new mongoose.Schema({
    /** Driver's full name */
    driverName: {
        type: String,
        required: [true, 'Driver name is required'],
        trim: true
    },

    /** Contact phone number */
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^[0-9]{11}$/, 'Please enter a valid phone number']
    },

    /** Driver's license number */
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },

    /** Residential address */
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },

    /** Current location description */
    location: {
        type: String,
        required: [true, 'Current location is required'],
        trim: true
    },

    /** Driver's availability status */
    status: {
        type: String,
        enum: {
            values: ['available', 'busy', 'offline'],
            message: '{VALUE} is not a valid status'
        },
        default: 'available'
    },

    /** Account creation timestamp */
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

/**
 * Add indexes for optimized queries
 * @description Improves performance for common query patterns
 */

// Index for phone number lookups
ambulanceDriverSchema.index({ phone: 1 });

// Index for license number searches
ambulanceDriverSchema.index({ licenseNumber: 1 });

// Index for status-based queries
ambulanceDriverSchema.index({ status: 1 });

// Compound index for status and location queries
ambulanceDriverSchema.index({ status: 1, location: 1 });

/**
 * Export the AmbulanceDriver model
 * @type {mongoose.Model<AmbulanceDriverSchema>}
 */
export default mongoose.model('AmbulanceDriver', ambulanceDriverSchema);