export default function verifyUserRole(req, res, next) {
    const token = req.cookies?.session;
    if (!token) {
        return res.status(401).json({ message: 'User is not authenticated' });
    } else {
        next();
    }
}
