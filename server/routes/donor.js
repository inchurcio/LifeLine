const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get donor's allocations
router.get('/allocations', verifyToken, requireRole('donor'), async (req, res) => {
    try {
        const [allocations] = await db.query(
            `SELECT br.*,
                    u.full_name as receiver_name,
                    z.name as zilla_name,
                    t.name as thana_name
             FROM blood_requests br
             LEFT JOIN users u ON br.receiver_id = u.id
             LEFT JOIN zillas z ON br.request_zilla = z.id
             LEFT JOIN thanas t ON br.request_thana = t.id
             WHERE br.allocated_donor_id = ?
             ORDER BY br.created_at DESC`,
            [req.user.userId]
        );

        res.json({ allocations });
    } catch (error) {
        console.error('Get allocations error:', error);
        res.status(500).json({ error: 'Failed to fetch allocations' });
    }
});

// Get donation history
router.get('/history', verifyToken, requireRole('donor'), async (req, res) => {
    try {
        const [donations] = await db.query(
            `SELECT d.*, 
                    br.blood_type, br.units,
                    u.full_name as receiver_name
             FROM donations d
             LEFT JOIN blood_requests br ON d.request_id = br.id
             LEFT JOIN users u ON br.receiver_id = u.id
             WHERE d.donor_id = ?
             ORDER BY d.donation_date DESC`,
            [req.user.userId]
        );

        res.json({ donations });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch donation history' });
    }
});

// Check eligibility to donate
router.get('/eligibility', verifyToken, requireRole('donor'), async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT last_donation_date FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const lastDonationDate = users[0].last_donation_date;

        if (!lastDonationDate) {
            return res.json({
                eligible: true,
                message: 'You have never donated before. You are eligible to donate.',
                days_until_eligible: 0
            });
        }

        const daysSinceLastDonation = Math.floor(
            (new Date() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24)
        );

        const eligible = daysSinceLastDonation >= 90;
        const daysUntilEligible = eligible ? 0 : 90 - daysSinceLastDonation;

        res.json({
            eligible,
            last_donation_date: lastDonationDate,
            days_since_last_donation: daysSinceLastDonation,
            days_until_eligible: daysUntilEligible,
            message: eligible
                ? 'You are eligible to donate blood.'
                : `You can donate again in ${daysUntilEligible} days.`
        });
    } catch (error) {
        console.error('Check eligibility error:', error);
        res.status(500).json({ error: 'Failed to check eligibility' });
    }
});

// Get connections (receivers matched with)
router.get('/connections', verifyToken, requireRole('donor'), async (req, res) => {
    try {
        const [connections] = await db.query(
            `SELECT DISTINCT 
                    u.id as receiver_id,
                    u.full_name as receiver_name,
                    br.blood_type,
                    br.status,
                    MAX(br.created_at) as last_request_date
             FROM blood_requests br
             JOIN users u ON br.receiver_id = u.id
             WHERE br.allocated_donor_id = ?
             GROUP BY u.id, u.full_name, br.blood_type, br.status
             ORDER BY last_request_date DESC`,
            [req.user.userId]
        );

        res.json({ connections });
    } catch (error) {
        console.error('Get connections error:', error);
        res.status(500).json({ error: 'Failed to fetch connections' });
    }
});

module.exports = router;
