/**
 * @fileoverview Authentication Routes for Healthcare System
 * @description Express router defining authentication endpoints including user registration,
 * login, and blood donor search functionality with proper middleware integration
 * @author Healthcare System Team
 * @version 1.0.0
 */

import express from 'express';
import { login, register, searchBloodDonors } from '../Controllers/authController.js';

// Create Express router instance for authentication routes
const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @description Register a new user (patient or doctor) in the system
 * @access Public
 * @body {string} name - Full name of the user
 * @body {string} email - Email address (must be unique)
 * @body {string} password - Password (will be hashed)
 * @body {string} role - User role ("patient" or "doctor")
 * @body {string} [gender] - Optional gender information
 * @body {string} [photo] - Optional profile photo URL
 * @returns {Object} Success message and status
 */
router.post('/register', register);

/**
 * @route POST /api/v1/auth/login
 * @description Authenticate user and return JWT token
 * @access Public
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * @returns {Object} JWT token and user information
 */
router.post('/login', login);

/**
 * @route GET /api/v1/auth/blood-donors
 * @description Search for blood donors by location and blood type
 * @access Private (requires authentication)
 * @query {string} district - Geographic district to search in
 * @query {string} [location] - Specific location within district
 * @query {string} bloodType - Required blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
 * @returns {Array} List of available blood donors matching criteria
 */
router.get('/blood-donors', searchBloodDonors);

/**
 * Export the authentication router for use in main application
 * @type {express.Router}
 */
export default router;