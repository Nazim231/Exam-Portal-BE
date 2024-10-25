import { Router } from 'express';
import Examinee from '../controllers/Examinee.js';

const app = Router();

app.post('/', Examinee.create);

export default app;
