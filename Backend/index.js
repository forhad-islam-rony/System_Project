import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './Routes/auth.js';
import userRoutes from './Routes/user.js';
import doctorRoutes from './Routes/doctor.js';
import reviewRoutes from './Routes/review.js';
import bookingRoute from './Routes/booking.js';
import adminRoutes from './Routes/admin.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: true,
};

// mideleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Api is working');
});

// mongodb connection
mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connection success');
  } catch (error) {
    console.log('MongoDB connection failed', error.message);
  }
};

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/bookings', bookingRoute);

// Error handling for server startup
const startServer = async () => {
  try {
    // First connect to MongoDB
    await connectDB();

    // Create HTTP server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying to close existing connection...`);
        require('child_process').exec(`npx kill-port ${PORT}`, (err) => {
          if (err) {
            console.error(`Failed to kill port ${PORT}:`, err);
            process.exit(1);
          }
          // Try starting the server again after a brief delay
          setTimeout(() => {
            server.listen(PORT);
          }, 1000);
        });
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM. Performing graceful shutdown...');
      server.close(() => {
        mongoose.connection.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();