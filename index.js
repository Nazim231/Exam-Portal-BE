import express from 'express';
import connectDB from './connection.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

connectDB();

// Middleware to parse JSON requests
app.use(express.json());

// Use routes
app.use('/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

