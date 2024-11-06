import express from 'express';
import Exam from '../controllers/Exam.js';
import Section from '../controllers/Section.js';
import restrictTo from '../middlewares/restrictTo.js';
import section from './section.js';
import Examinee from '../controllers/Examinee.js';

const router = express.Router();

router.post('/', restrictTo('Faculty'), Exam.create);
router.get('/', Exam.fetch);
router.use('/section', section);
router.get('/:examId', Exam.fetchById);

export default router;
