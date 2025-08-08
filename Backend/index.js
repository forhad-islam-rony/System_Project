/**
 * @fileoverview Main Express Server Entry Point for Healthcare System
 * @description Primary server file that initializes Express application, sets up middleware,
 * configures routes, connects to MongoDB, and starts the server with error handling
 * @author Healthcare System Team
 * @version 1.0.0
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all route modules for different healthcare features
import authRoute from './Routes/auth.js';           // Authentication and registration
import userRoutes from './Routes/user.js';         // User profile management
import doctorRoutes from './Routes/doctor.js';     // Doctor management
import reviewRoutes from './Routes/review.js';     // Doctor reviews and ratings
import bookingRoute from './Routes/booking.js';    // Appointment booking
import adminRoute from './Routes/admin.js';        // Admin dashboard and controls
import postRoute from './Routes/posts.js';         // Community health posts
import moderatorRoutes from './Routes/moderator.js'; // Content moderation
import medicineRoutes from './Routes/medicineRoutes.js'; // Pharmacy management
import cartRoutes from './Routes/cartRoutes.js';   // Shopping cart functionality
import orderRoutes from './Routes/orderRoutes.js'; // Order processing
import contactRoute from './Routes/contact.js';    // Contact form handling
import ambulanceRoutes from './Routes/ambulanceRoutes.js'; // Emergency ambulance services
import chatbotRoutes from './Routes/chatbot.js';   // AI medical consultation
import debugRoutes from './Routes/debug.js';       // Development debugging routes


// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Server port configuration (default to 5000 for healthcare system)
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: true, // For development, you might want to allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/bookings', bookingRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/posts', postRoute);
app.use('/api/v1/moderator', moderatorRoutes);
app.use('/api/v1/medicines', medicineRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/ambulance', ambulanceRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/debug', debugRoutes);

// Add this test route
app.get('/api/v1/test', async (req, res) => {
  try {
    // Test database connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ 
      message: 'Server is running',
      dbConnected: mongoose.connection.readyState === 1,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});
app.use('/api/v1/contact', contactRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

// MongoDB connection
mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB database connected');
  } catch (err) {
    console.log('MongoDB database connection failed:', err.message);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log('Failed to start server:', err);
  }
};

startServer();

export default app;


