import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoute from './Routes/auth.js';
import userRoutes from './Routes/user.js';
import doctorRoutes from './Routes/doctor.js';
import reviewRoutes from './Routes/review.js';
import bookingRoute from './Routes/booking.js';
import adminRoute from './Routes/admin.js';
import postRoute from './Routes/posts.js';
import moderatorRoutes from './Routes/moderator.js';
import medicineRoutes from './Routes/medicineRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import contactRoute from './Routes/contact.js';

dotenv.config();
const app = express();
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