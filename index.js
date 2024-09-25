import express from 'express';
import connectDB from './connection.js';
import auth from './routes/auth.js';
import exam from './routes/exam.js';
import cookieParser from 'cookie-parser';
import verifyUser from './middlewares/verifyUser.js';

const app = express();

connectDB();

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API Routes
app.use('/auth', auth);
app.use('/exam', verifyUser, exam);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
