import { auth as Authentication } from '../services/auth.js';

export default function verifyUser(req, res, next) {
    const token = req.cookies?.session;
    if (!token) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    const user = Authentication.validateToken(token);
    req.user = user;

    next();
}
