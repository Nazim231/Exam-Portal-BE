import express from "express";
import Exam from "../controllers/Exam.js";

const router = express.Router();

router.post('/create', Exam.create);

export default router;