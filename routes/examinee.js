import { Router } from 'express';
import Examinee from '../controllers/Examinee.js';

const app = Router();

app.post('/', Examinee.create);
// app.post('/attempt-exam', Examinee.attemptExam);

export default app;
