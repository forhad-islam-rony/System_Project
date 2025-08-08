// server.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// All route imports...
import authRoute from './Routes/auth.js';
// ...other imports

dotenv.config();
mongoose.set('strictQuery', false);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGO_URL);
  console.log('MongoDB connected');
};

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/test', (req, res) => {
  res.json({ message: 'Serverless route working 🎉' });
});

app.use('/api/v1/auth', authRoute);
// ... other routes

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    message: err.message || "Something went wrong!",
    stack: err.stack
  });
});

await connectDB(); // IMPORTANT: connect before exporting

export default app;
