import express from 'express';
import Exam from '../controllers/Exam.js';
import restrictTo from '../middlewares/restrictTo.js';

const router = express.Router();

router.post('/create', restrictTo('Faculty'), Exam.create);

export default router;
