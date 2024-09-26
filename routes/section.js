import express from "express";
import Section from "../controllers/Section.js";

const router = express.Router();

router.post('/create', Section.create);

export default router;