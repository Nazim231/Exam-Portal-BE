import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import connectDB from './connection.js';
import verifyUser from './middlewares/verifyUser.js';
import auth from './routes/auth.js';
import exam from './routes/exam.js';
import examinee from './routes/examinee.js';
import logRequest from './middlewares/logRequest.js';
import restrictTo from './middlewares/restrictTo.js';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();

connectDB();
configDotenv();

// Socket IO
const httpServ = createServer(app, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
        allowedHeader: ['Content-Type']
    },
});
const io = new Server(httpServ);

// Middleware to parse JSON requests
app.use(logRequest);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// io.on('connection', (socket) => {
//     console.log('New Client Connected');
//     console.log('Socket $socket: ', socket);

//     socket.on('join', ({ userId }) => {
//         console.log(`${userId} joined`);
//     });
// });

app.get('/', (req, res) => {
    return res.json({message: 'Server is running'});
})

// API Routes
app.use('/auth', auth);
app.use('/exam', verifyUser, exam);
app.use('/examinees', verifyUser, restrictTo(['Faculty']), examinee);

// Start the server
const PORT = process.env.PORT || 3000;
httpServ.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
