import express from "express";
import Question from "../controllers/Question.js";

const router = express.Router();

router.post('/create', Question.create);

export default router;