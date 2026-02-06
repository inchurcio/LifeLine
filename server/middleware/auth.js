const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Verify JWT Token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh user data from database
        const [users] = await db.query(
            'SELECT id, email, full_name, is_donor, is_receiver, is_staff, is_admin, is_suspended FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        const user = users[0];

        if (user.is_suspended) {
            return res.status(403).json({ error: 'Account suspended. Please contact admin.' });
        }

        req.user = {
            userId: user.id,
            email: user.email,
            full_name: user.full_name,
            is_donor: user.is_donor,
            is_receiver: user.is_receiver,
            is_staff: user.is_staff,
            is_admin: user.is_admin,
            current_role: decoded.current_role || 'receiver' // Default to receiver
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        return res.status(500).json({ error: 'Authentication failed.' });
    }
};

// Require specific role
const requireRole = (role) => {
    return (req, res, next) => {
        if (role === 'donor' && !req.user.is_donor) {
            return res.status(403).json({ error: 'Access denied. Donor role required.' });
        }
        if (role === 'receiver' && !req.user.is_receiver) {
            return res.status(403).json({ error: 'Access denied. Receiver role required.' });
        }
        if (role === 'staff' && !req.user.is_staff) {
            return res.status(403).json({ error: 'Access denied. Staff role required.' });
        }
        if (role === 'admin' && !req.user.is_admin) {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }
        next();
    };
};

// Require admin role
const requireAdmin = (req, res, next) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = {
    verifyToken,
    requireRole,
    requireAdmin
};
