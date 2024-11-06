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
router.post('/attempt-exam', Examinee.attemptExam);
router.get('/attempted-exams', Exam.attemptedExams);
router.get('/result/:examId', Exam.result);
router.get('/detailed-result/:examId', Exam.detailedReport);
router.get('/mark-attempted/:examId', Exam.markAsAttempted);
router.get('/:examId/section', Section.get);
router.get('/:examId/examinees', Examinee.get);
router.get('/:examId', Exam.fetchById);
export default router;
