import express from 'express';
import Section from '../controllers/Section.js';
import quesRoutes from './question.js';

const router = express.Router();

router.post('/create', Section.create);
router.use('/question', quesRoutes);
export default router;
