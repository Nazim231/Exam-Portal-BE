import express from 'express';
import getUserExamsController from '../controllers/getUserExams.js';
import verifyUser from '../middlewares/verifyUser.js';

const router = express.Router();

router.get('/', verifyUser, getUserExamsController.getExamsByUser);

export default router;
