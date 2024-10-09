import express from 'express';
import Exam from '../controllers/Exam.js';
import restrictTo from '../middlewares/restrictTo.js';
import section from './section.js';

const router = express.Router();

router.post('/', restrictTo('Faculty'), Exam.create);
router.get('/', Exam.fetch);
router.use('/section', section);

export default router;
