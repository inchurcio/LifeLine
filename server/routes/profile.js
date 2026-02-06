const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Get user profile
router.get('/', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.*, z.name as zilla_name, t.name as thana_name
             FROM users u
             LEFT JOIN zillas z ON u.address_zilla = z.id
             LEFT JOIN thanas t ON u.address_thana = t.id
             WHERE u.id = ?`,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        delete user.password_hash;

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update profile
router.put('/', verifyToken, async (req, res) => {
    try {
        const { full_name, address_thana, address_zilla, blood_type, phone } = req.body;

        const updates = [];
        const values = [];

        if (full_name) {
            updates.push('full_name = ?');
            values.push(full_name);
        }
        if (address_thana) {
            updates.push('address_thana = ?');
            values.push(address_thana);
        }
        if (address_zilla) {
            updates.push('address_zilla = ?');
            values.push(address_zilla);
        }
        if (blood_type) {
            updates.push('blood_type = ?');
            values.push(blood_type);
        }
        if (phone) {
            updates.push('phone = ?');
            values.push(phone);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.user.userId);

        await db.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Enable donor role
router.post('/enable-donor', verifyToken, async (req, res) => {
    try {
        await db.query(
            'UPDATE users SET is_donor = TRUE WHERE id = ?',
            [req.user.userId]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)',
            [req.user.userId, 'DONOR_ROLE_ENABLED', 'User enabled donor role']
        );

        res.json({ message: 'Donor role enabled successfully' });
    } catch (error) {
        console.error('Enable donor error:', error);
        res.status(500).json({ error: 'Failed to enable donor role' });
    }
});

// Enable receiver role
router.post('/enable-receiver', verifyToken, async (req, res) => {
    try {
        await db.query(
            'UPDATE users SET is_receiver = TRUE WHERE id = ?',
            [req.user.userId]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)',
            [req.user.userId, 'RECEIVER_ROLE_ENABLED', 'User enabled receiver role']
        );

        res.json({ message: 'Receiver role enabled successfully' });
    } catch (error) {
        console.error('Enable receiver error:', error);
        res.status(500).json({ error: 'Failed to enable receiver role' });
    }
});

// Disable role (with validation)
router.post('/disable-role', verifyToken, async (req, res) => {
    try {
        const { role } = req.body; // 'donor' or 'receiver'

        if (!['donor', 'receiver'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check for active requests/allocations
        if (role === 'receiver') {
            const [activeRequests] = await db.query(
                'SELECT COUNT(*) as count FROM blood_requests WHERE receiver_id = ? AND status IN (?, ?, ?)',
                [req.user.userId, 'pending', 'allocated', 'crossmatch_passed']
            );

            if (activeRequests[0].count > 0) {
                return res.status(400).json({
                    error: 'Cannot disable receiver role. You have active blood requests.'
                });
            }
        }

        if (role === 'donor') {
            const [activeAllocations] = await db.query(
                'SELECT COUNT(*) as count FROM blood_requests WHERE allocated_donor_id = ? AND status IN (?, ?)',
                [req.user.userId, 'allocated', 'crossmatch_passed']
            );

            if (activeAllocations[0].count > 0) {
                return res.status(400).json({
                    error: 'Cannot disable donor role. You have active allocations.'
                });
            }
        }

        const field = role === 'donor' ? 'is_donor' : 'is_receiver';
        await db.query(
            `UPDATE users SET ${field} = FALSE WHERE id = ?`,
            [req.user.userId]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)',
            [req.user.userId, `${role.toUpperCase()}_ROLE_DISABLED`, `User disabled ${role} role`]
        );

        res.json({ message: `${role} role disabled successfully` });
    } catch (error) {
        console.error('Disable role error:', error);
        res.status(500).json({ error: 'Failed to disable role' });
    }
});

module.exports = router;
