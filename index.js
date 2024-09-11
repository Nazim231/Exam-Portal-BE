import express from 'express';
import connectDB from './connection.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';

const app = express();

connectDB();

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// API Routes
app.use('/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

