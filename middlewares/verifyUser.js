import { auth as Authentication } from '../services/auth.js';

/**
 * Middleware to verify user authentication via session token in cookies.
 *
 * Retrieves the session token and validates it. Sends a 401 response if
 * the token is missing or invalid or user is not verified.
 * Attaches user info to the request if valid.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 *
 * @returns {void} Calls the next middleware or sends a response.
 */
export default function verifyUser(req, res, next) {
    const token = req.cookies?.session;
    if (!token) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    const user = Authentication.validateToken(token);
    if (!user) {
        res.clearCookie('session', { httpOnly: true, secure: false, sameSite: 'None' });
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    if (!user.verified && !['/verify-email', '/resend-email'].includes(req.url)) {
        return res.status(401).json({ message: 'User not verified' });
    }

    req.user = user;
    return next();
}
