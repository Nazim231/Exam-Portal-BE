import express from 'express';
import Section from '../controllers/Section.js';
import quesRoutes from './question.js';

const router = express.Router();

router.get('/', Section.get);
router.post('/attempt-section', Section.attempt);
router.post('/submit-section', Section.submit);
router.post('/create', (req, res) => Section.create(req, res));
router.use('/question', quesRoutes);
export default router;
