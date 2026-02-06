const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Verify crossmatch
router.post('/crossmatch', verifyToken, requireRole('staff'), async (req, res) => {
    try {
        const { request_id, crossmatch_result } = req.body; // 'passed' or 'failed'

        if (!request_id || !crossmatch_result) {
            return res.status(400).json({ error: 'request_id and crossmatch_result are required' });
        }

        if (!['passed', 'failed'].includes(crossmatch_result)) {
            return res.status(400).json({ error: 'crossmatch_result must be "passed" or "failed"' });
        }

        // Get request
        const [requests] = await db.query(
            'SELECT * FROM blood_requests WHERE id = ?',
            [request_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const request = requests[0];

        if (request.status !== 'allocated') {
            return res.status(400).json({ error: 'Request must be in allocated status to verify crossmatch' });
        }

        // Update crossmatch status
        const newStatus = crossmatch_result === 'passed' ? 'crossmatch_passed' : 'crossmatch_failed';

        await db.query(
            'UPDATE blood_requests SET crossmatch_status = ?, status = ?, verified_by_staff_id = ? WHERE id = ?',
            [crossmatch_result, newStatus, req.user.userId, request_id]
        );

        // Log action
        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'CROSSMATCH_VERIFIED', 'blood_request', request_id, `Crossmatch ${crossmatch_result}`]
        );

        res.json({
            message: 'Crossmatch verified successfully',
            result: crossmatch_result
        });
    } catch (error) {
        console.error('Verify crossmatch error:', error);
        res.status(500).json({ error: 'Failed to verify crossmatch' });
    }
});

// Get assigned campaigns
router.get('/campaigns', verifyToken, requireRole('staff'), async (req, res) => {
    try {
        const [campaigns] = await db.query(
            `SELECT c.*, sc.role, sc.request_status, sc.points_earned,
                    z.name as zilla_name, t.name as thana_name
             FROM staff_campaigns sc
             JOIN campaigns c ON sc.campaign_id = c.id
             LEFT JOIN zillas z ON c.location_zilla = z.id
             LEFT JOIN thanas t ON c.location_thana = t.id
             WHERE sc.staff_id = ?
             ORDER BY c.start_date DESC`,
            [req.user.userId]
        );

        res.json({ campaigns });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// Request to join campaign
router.post('/campaigns/request-join', verifyToken, requireRole('staff'), async (req, res) => {
    try {
        const { campaign_id } = req.body;

        if (!campaign_id) {
            return res.status(400).json({ error: 'campaign_id is required' });
        }

        // Check if already assigned or requested
        const [existing] = await db.query(
            'SELECT * FROM staff_campaigns WHERE staff_id = ? AND campaign_id = ?',
            [req.user.userId, campaign_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'You have already requested or been assigned to this campaign' });
        }

        // Get user's staff role
        const [users] = await db.query(
            'SELECT staff_role FROM users WHERE id = ?',
            [req.user.userId]
        );

        const staffRole = users[0].staff_role;

        // Insert request
        await db.query(
            'INSERT INTO staff_campaigns (staff_id, campaign_id, role, request_status) VALUES (?, ?, ?, ?)',
            [req.user.userId, campaign_id, staffRole, 'requested']
        );

        res.json({ message: 'Campaign join request submitted successfully' });
    } catch (error) {
        console.error('Request join error:', error);
        res.status(500).json({ error: 'Failed to submit join request' });
    }
});

// Request exemption from campaign
router.post('/campaigns/request-exemption', verifyToken, requireRole('staff'), async (req, res) => {
    try {
        const { campaign_id, reason } = req.body;

        if (!campaign_id) {
            return res.status(400).json({ error: 'campaign_id is required' });
        }

        // Check if assigned
        const [existing] = await db.query(
            'SELECT * FROM staff_campaigns WHERE staff_id = ? AND campaign_id = ? AND request_status = ?',
            [req.user.userId, campaign_id, 'assigned']
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'You are not assigned to this campaign' });
        }

        // Update to exemption requested
        await db.query(
            'UPDATE staff_campaigns SET request_status = ? WHERE staff_id = ? AND campaign_id = ?',
            ['exemption_requested', req.user.userId, campaign_id]
        );

        // Log
        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'EXEMPTION_REQUESTED', 'campaign', campaign_id, reason]
        );

        res.json({ message: 'Exemption request submitted successfully' });
    } catch (error) {
        console.error('Request exemption error:', error);
        res.status(500).json({ error: 'Failed to submit exemption request' });
    }
});

module.exports = router;

// Get all requests for crossmatch verification (staff can view all allocated requests)
router.get('/requests', verifyToken, requireRole('staff'), async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT br.*, 
                   donor.full_name as donor_name,
                   receiver.full_name as receiver_name,
                   z.name as zilla_name,
                   t.name as thana_name
            FROM blood_requests br
            LEFT JOIN users donor ON br.allocated_donor_id = donor.id
            LEFT JOIN users receiver ON br.receiver_id = receiver.id
            LEFT JOIN zillas z ON br.request_zilla = z.id
            LEFT JOIN thanas t ON br.request_thana = t.id
            ORDER BY br.created_at DESC`
        );

        res.json({ requests });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});
