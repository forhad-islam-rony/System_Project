// api/index.js
import serverless from 'serverless-http';
import app from './server.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URL);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB error:', error);
  }
};

await connectDB();

export const handler = serverless(app);
