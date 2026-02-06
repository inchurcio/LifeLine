const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Send message
router.post('/', verifyToken, async (req, res) => {
    try {
        const { request_id, message_text } = req.body;

        if (!request_id || !message_text) {
            return res.status(400).json({ error: 'request_id and message_text are required' });
        }

        if (message_text.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Get request details
        const [requests] = await db.query(
            'SELECT receiver_id, allocated_donor_id FROM blood_requests WHERE id = ?',
            [request_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const request = requests[0];

        // Determine sender and receiver
        let to_user_id;
        if (req.user.userId === request.receiver_id) {
            to_user_id = request.allocated_donor_id;
        } else if (req.user.userId === request.allocated_donor_id) {
            to_user_id = request.receiver_id;
        } else {
            return res.status(403).json({ error: 'Access denied. You are not part of this request.' });
        }

        if (!to_user_id) {
            return res.status(400).json({ error: 'No donor allocated yet. Cannot send message.' });
        }

        // Insert message
        await db.query(
            'INSERT INTO messages (request_id, from_user_id, to_user_id, message_text) VALUES (?, ?, ?, ?)',
            [request_id, req.user.userId, to_user_id, message_text]
        );

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get messages for a request
router.get('/:requestId', verifyToken, async (req, res) => {
    try {
        const requestId = req.params.requestId;

        // Verify user is part of this request
        const [requests] = await db.query(
            'SELECT receiver_id, allocated_donor_id FROM blood_requests WHERE id = ?',
            [requestId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const request = requests[0];

        if (req.user.userId !== request.receiver_id &&
            req.user.userId !== request.allocated_donor_id &&
            !req.user.is_staff && !req.user.is_admin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get messages
        const [messages] = await db.query(
            `SELECT m.*,
                    sender.full_name as sender_name,
                    receiver.full_name as receiver_name
             FROM messages m
             LEFT JOIN users sender ON m.from_user_id = sender.id
             LEFT JOIN users receiver ON m.to_user_id = receiver.id
             WHERE m.request_id = ?
             ORDER BY m.created_at ASC`,
            [requestId]
        );

        // Mark messages as read if they're sent to current user
        await db.query(
            'UPDATE messages SET is_read = TRUE WHERE request_id = ? AND to_user_id = ?',
            [requestId, req.user.userId]
        );

        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get unread message count
router.get('/unread/count', verifyToken, async (req, res) => {
    try {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM messages WHERE to_user_id = ? AND is_read = FALSE',
            [req.user.userId]
        );

        res.json({ unread_count: result[0].count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

module.exports = router;
