import express from 'express';
import Auth from '../controllers/Auth.js';
import verifyUser from '../middlewares/verifyUser.js';

const router = express.Router();

router.post('/register', Auth.register);
router.post('/login', Auth.login);
router.get('/logout', verifyUser, Auth.logout);
router.post('/verify-email', verifyUser, Auth.verifyEmail);
router.get('/resend-email', verifyUser, Auth.resendEmail);

export default router;
