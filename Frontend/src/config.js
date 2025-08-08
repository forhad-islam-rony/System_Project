/**
 * @fileoverview Frontend Configuration Settings
 * @description Central configuration file for API endpoints, environment settings,
 * and global constants used throughout the frontend application
 * @author Healthcare System Team
 * @version 1.0.0
 */

/**
 * Base URL for all API requests to the backend server
 * @constant {string} BASE_URL
 * @description The root URL for all API endpoints. In development, points to localhost:5000.
 * In production, this should be updated to point to the deployed backend server.
 * All API calls in the application will be prefixed with this URL.
 * @example
 * // Usage in API calls:
 * fetch(`${BASE_URL}/auth/login`, { ... })
 * // Results in: http://localhost:5000/api/v1/auth/login
 */
export const BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Authentication token retrieved from browser's local storage
 * @constant {string|null} token
 * @description JWT authentication token stored in localStorage after successful login.
 * Used for authenticating API requests to protected endpoints.
 * Returns null if no token is stored (user not logged in).
 * @example
 * // Usage in API headers:
 * headers: {
 *   'Authorization': `Bearer ${token}`,
 *   'Content-Type': 'application/json'
 * }
 */
export const token = localStorage.getItem('token'); 