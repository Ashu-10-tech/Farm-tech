const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Authorization Middleware
 * @param {Array<string>} roles - Array of roles allowed to access the route (e.g., ['farmer', 'company'])
 */
module.exports = (roles = []) => {
    return (req, res, next) => {
        // 1. Get token from header (using common convention 'x-auth-token')
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ msg: 'Authorization denied. Token not found.' });
        }

        try {
            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user; // decoded.user contains { id, role, username }

            // 3. Check for role authorization
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ msg: 'Access denied: Insufficient privileges.' });
            }

            next(); // Token is valid and role is authorized
        } catch (e) {
            res.status(401).json({ msg: 'Token is not valid.' });
        }
    };
};