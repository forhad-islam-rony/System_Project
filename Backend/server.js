// api/server.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env
dotenv.config();

// All route imports...
import authRoute from './Routes/auth.js';
import userRoutes from './Routes/user.js';
// ... etc

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
app.get('/test', (req, res) => res.json({ message: 'Basic test working' }));
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoutes);
// ... other routes
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    message: err.message || 'Something went wrong!',
    stack: err.stack
  });
});

export default app;
