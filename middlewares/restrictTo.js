/**
 * Middleware to restrict access based on user roles.
 *
 * @param {string|string[]} role - The required role(s) for access.
 * @returns {Function} Express middleware function that checks user authentication and authorization.
 */
export default function restrictTo(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthenticated' });
        }

        if (typeof role === 'string' && req.user.role === role) return next();

        if (Array.isArray(role)) {
            for (const r of role) {
                if (req.user.role === r) return next();
            };
        }

        return res.status(403).json({ message: 'Unauthorized' });
    };
}
