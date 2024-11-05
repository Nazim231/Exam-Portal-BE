import express from "express";
import Question from "../controllers/Question.js";

const router = express.Router();

router.post('/get-questions', Question.get);
router.post('/submit', Question.submitAnswer);
router.post('/create', Question.create);

export default router;