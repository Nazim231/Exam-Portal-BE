import express from 'express';
import getUserExamsController from '../controllers/getUserExams.js';
import verifyUser from '../middlewares/verifyUser.js';
//import middleware restrict if want role based

const router = express.Router();

router.get('/', verifyUser, getUserExamsController.getExamsByUser); // add restrictTo["faculity", "student"] after verify user if want role based

export default router;
