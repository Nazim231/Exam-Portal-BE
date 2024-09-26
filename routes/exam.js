import express from 'express';
import Exam from '../controllers/Exam.js';
import restrictTo from '../middlewares/restrictTo.js';
import section from './section.js';

const router = express.Router();

router.post('/create', restrictTo('Faculty'), Exam.create);
router.use('/section', section);

export default router;
