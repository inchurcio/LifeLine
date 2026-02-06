const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(verifyToken);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        // Total users
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');

        // Total donors
        const [totalDonors] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_donor = TRUE');

        // Total receivers
        const [totalReceivers] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_receiver = TRUE');

        // Active requests
        const [activeRequests] = await db.query(
            'SELECT COUNT(*) as count FROM blood_requests WHERE status IN (?, ?, ?)',
            ['pending', 'allocated', 'crossmatch_passed']
        );

        // Completed requests
        const [completedRequests] = await db.query(
            'SELECT COUNT(*) as count FROM blood_requests WHERE status = ?',
            ['completed']
        );

        // Blood storage (with zilla information)
        const [bloodStorage] = await db.query(
            `SELECT bs.*, z.name as zilla_name 
             FROM blood_storage bs
             JOIN zillas z ON bs.zilla_id = z.id
             ORDER BY z.name, bs.blood_type`
        );

        // Blood storage summary (total across all zillas)
        const [bloodStorageSummary] = await db.query(
            `SELECT blood_type, SUM(units_available) as total_units
             FROM blood_storage
             GROUP BY blood_type
             ORDER BY blood_type`
        );

        // Recent activities (last 10 logs)
        const [recentLogs] = await db.query(
            `SELECT l.*, u.full_name as user_name
             FROM logs l
             LEFT JOIN users u ON l.user_id = u.id
             ORDER BY l.created_at DESC
             LIMIT 10`
        );

        res.json({
            statistics: {
                total_users: totalUsers[0].count,
                total_donors: totalDonors[0].count,
                total_receivers: totalReceivers[0].count,
                active_requests: activeRequests[0].count,
                completed_requests: completedRequests[0].count
            },
            blood_storage: bloodStorage,
            blood_storage_summary: bloodStorageSummary,
            recent_activities: recentLogs
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get pending staff registrations
router.get('/staff/pending', async (req, res) => {
    try {
        const [pendingStaff] = await db.query(
            `SELECT u.*, z.name as zilla_name, t.name as thana_name
             FROM users u
             LEFT JOIN zillas z ON u.address_zilla = z.id
             LEFT JOIN thanas t ON u.address_thana = t.id
             WHERE u.is_staff = TRUE AND u.staff_status = ?
             ORDER BY u.created_at DESC`,
            ['pending']
        );

        res.json({ pending_staff: pendingStaff });
    } catch (error) {
        console.error('Get pending staff error:', error);
        res.status(500).json({ error: 'Failed to fetch pending staff' });
    }
});

// Approve staff registration
router.post('/staff/approve', async (req, res) => {
    try {
        const { staff_id } = req.body;

        if (!staff_id) {
            return res.status(400).json({ error: 'staff_id is required' });
        }

        await db.query(
            'UPDATE users SET staff_status = ? WHERE id = ? AND is_staff = TRUE',
            ['approved', staff_id]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'STAFF_APPROVED', 'user', staff_id, 'Staff registration approved']
        );

        res.json({ message: 'Staff approved successfully' });
    } catch (error) {
        console.error('Approve staff error:', error);
        res.status(500).json({ error: 'Failed to approve staff' });
    }
});

// Reject staff registration
router.post('/staff/reject', async (req, res) => {
    try {
        const { staff_id, reason } = req.body;

        if (!staff_id) {
            return res.status(400).json({ error: 'staff_id is required' });
        }

        await db.query(
            'UPDATE users SET staff_status = ? WHERE id = ? AND is_staff = TRUE',
            ['rejected', staff_id]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'STAFF_REJECTED', 'user', staff_id, reason || 'Staff registration rejected']
        );

        res.json({ message: 'Staff rejected successfully' });
    } catch (error) {
        console.error('Reject staff error:', error);
        res.status(500).json({ error: 'Failed to reject staff' });
    }
});

// Create admin account
router.post('/create-admin', async (req, res) => {
    try {
        const { email, phone, password, full_name, address_thana, address_zilla, blood_type } = req.body;

        if (!email || !phone || !password || !full_name || !address_thana || !address_zilla || !blood_type) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email exists
        const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Check if phone exists
        const [existingPhone] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
            return res.status(409).json({ error: 'Phone already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert admin
        const [result] = await db.query(
            `INSERT INTO users (email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_admin, is_staff, staff_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, TRUE, ?)`,
            [email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, 'approved']
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'ADMIN_CREATED', 'user', result.insertId, `New admin created: ${email}`]
        );

        res.status(201).json({ message: 'Admin account created successfully' });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ error: 'Failed to create admin account' });
    }
});

// Mark request as complete (with crossmatch validation)
router.post('/requests/:id/complete', async (req, res) => {
    try {
        const requestId = req.params.id;

        // Get request
        const [requests] = await db.query(
            'SELECT * FROM blood_requests WHERE id = ?',
            [requestId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const request = requests[0];

        // CRITICAL VALIDATION: Crossmatch must be passed
        if (request.crossmatch_status !== 'passed') {
            return res.status(400).json({
                error: 'Cannot complete request. Crossmatch must be verified and passed by staff first.',
                current_crossmatch_status: request.crossmatch_status
            });
        }

        if (request.status === 'completed') {
            return res.status(400).json({ error: 'Request already completed' });
        }

        // Update request status
        await db.query(
            'UPDATE blood_requests SET status = ?, completed_at = NOW() WHERE id = ?',
            ['completed', requestId]
        );

        // Check if this is a blood bank allocation or donor allocation
        if (request.allocated_donor_id === null) {
            // BLOOD BANK ALLOCATION - Deduct from inventory
            const [updateResult] = await db.query(
                'UPDATE blood_storage SET units_available = units_available - 1 WHERE zilla_id = ? AND blood_type = ? AND units_available > 0',
                [request.request_zilla, request.blood_type]
            );

            if (updateResult.affectedRows === 0) {
                // Rollback - no stock available (race condition)
                await db.query(
                    'UPDATE blood_requests SET status = ?, completed_at = NULL WHERE id = ?',
                    ['allocated', requestId]
                );
                return res.status(400).json({
                    error: 'Blood bank inventory depleted',
                    message: 'The blood bank no longer has this blood type in stock. Please contact staff.'
                });
            }

            // Log blood bank usage
            await db.query(
                'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
                [req.user.userId, 'BLOOD_BANK_USED', 'blood_request', requestId, `1 unit of ${request.blood_type} deducted from blood bank inventory`]
            );
        } else {
            // DONOR ALLOCATION - Award points and update donor
            await db.query(
                'UPDATE users SET points = points + 10, last_donation_date = CURDATE() WHERE id = ?',
                [request.allocated_donor_id]
            );

            // Create donation record
            await db.query(
                'INSERT INTO donations (donor_id, request_id, donation_date, units_donated, points_earned) VALUES (?, ?, CURDATE(), ?, ?)',
                [request.allocated_donor_id, requestId, request.units, 10]
            );
        }

        // Log completion
        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'REQUEST_COMPLETED', 'blood_request', requestId, 'Blood request marked as completed']
        );

        res.json({
            message: 'Request completed successfully',
            points_awarded: 10
        });
    } catch (error) {
        console.error('Complete request error:', error);
        res.status(500).json({ error: 'Failed to complete request' });
    }
});

// Manually cancel request
router.post('/requests/:id/cancel', async (req, res) => {
    try {
        const { reason } = req.body;
        const requestId = req.params.id;

        const [requests] = await db.query(
            'SELECT * FROM blood_requests WHERE id = ?',
            [requestId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (requests[0].status === 'completed') {
            return res.status(400).json({ error: 'Cannot cancel completed request' });
        }

        await db.query(
            'UPDATE blood_requests SET status = ?, cancellation_reason = ? WHERE id = ?',
            ['cancelled', reason || 'Cancelled by admin', requestId]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'REQUEST_CANCELLED_BY_ADMIN', 'blood_request', requestId, reason]
        );

        res.json({ message: 'Request cancelled successfully' });
    } catch (error) {
        console.error('Cancel request error:', error);
        res.status(500).json({ error: 'Failed to cancel request' });
    }
});

// Suspend user
router.post('/users/:id/suspend', async (req, res) => {
    try {
        const { reason } = req.body;
        const userId = req.params.id;

        if (!reason) {
            return res.status(400).json({ error: 'Suspension reason is required' });
        }

        await db.query(
            'UPDATE users SET is_suspended = TRUE, suspension_reason = ? WHERE id = ?',
            [reason, userId]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'USER_SUSPENDED', 'user', userId, reason]
        );

        res.json({ message: 'User suspended successfully' });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ error: 'Failed to suspend user' });
    }
});

// Unsuspend user
router.post('/users/:id/unsuspend', async (req, res) => {
    try {
        const userId = req.params.id;

        await db.query(
            'UPDATE users SET is_suspended = FALSE, suspension_reason = NULL WHERE id = ?',
            [userId]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'USER_UNSUSPENDED', 'user', userId, 'User account reactivated']
        );

        res.json({ message: 'User unsuspended successfully' });
    } catch (error) {
        console.error('Unsuspend user error:', error);
        res.status(500).json({ error: 'Failed to unsuspend user' });
    }
});

// Create campaign
router.post('/campaigns', async (req, res) => {
    try {
        const { name, description, start_date, end_date, location_zilla, location_thana, required_doctors, required_organizers } = req.body;

        if (!name || !start_date || !end_date || !location_zilla) {
            return res.status(400).json({ error: 'name, start_date, end_date, and location_zilla are required' });
        }

        const [result] = await db.query(
            'INSERT INTO campaigns (name, description, start_date, end_date, location_zilla, location_thana, required_doctors, required_organizers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, start_date, end_date, location_zilla, location_thana, required_doctors || 5, required_organizers || 5]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'CAMPAIGN_CREATED', 'campaign', result.insertId, `Campaign created: ${name}`]
        );

        res.status(201).json({
            message: 'Campaign created successfully',
            campaign_id: result.insertId
        });
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

// Assign staff to campaign
router.put('/campaigns/:id/assign-staff', async (req, res) => {
    try {
        const { staff_id, role } = req.body; // role: 'doctor' or 'organizer'
        const campaignId = req.params.id;

        if (!staff_id || !role) {
            return res.status(400).json({ error: 'staff_id and role are required' });
        }

        // Check if already assigned
        const [existing] = await db.query(
            'SELECT * FROM staff_campaigns WHERE staff_id = ? AND campaign_id = ?',
            [staff_id, campaignId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Staff already assigned to this campaign' });
        }

        await db.query(
            'INSERT INTO staff_campaigns (staff_id, campaign_id, role, request_status) VALUES (?, ?, ?, ?)',
            [staff_id, campaignId, role, 'assigned']
        );

        res.json({ message: 'Staff assigned to campaign successfully' });
    } catch (error) {
        console.error('Assign staff error:', error);
        res.status(500).json({ error: 'Failed to assign staff' });
    }
});

// Get all requests (for admin management)
router.get('/requests', async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT br.*,
                    receiver.full_name as receiver_name,
                    donor.full_name as donor_name,
                    z.name as zilla_name,
                    t.name as thana_name
             FROM blood_requests br
             LEFT JOIN users receiver ON br.receiver_id = receiver.id
             LEFT JOIN users donor ON br.allocated_donor_id = donor.id
             LEFT JOIN zillas z ON br.request_zilla = z.id
             LEFT JOIN thanas t ON br.request_thana = t.id
             ORDER BY br.created_at DESC
             LIMIT 100`
        );

        res.json({ requests });
    } catch (error) {
        console.error('Get all requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get all campaigns with staff count
router.get('/campaigns', async (req, res) => {
    try {
        const [campaigns] = await db.query(
            `SELECT c.*,
                    c.name as campaign_name,
                    z.name as zilla_name,
                    t.name as thana_name,
                    COUNT(sc.staff_id) as staff_count
             FROM campaigns c
             LEFT JOIN zillas z ON c.location_zilla = z.id
             LEFT JOIN thanas t ON c.location_thana = t.id
             LEFT JOIN staff_campaigns sc ON c.id = sc.campaign_id AND sc.request_status = 'approved'
             GROUP BY c.id
             ORDER BY c.start_date DESC`
        );

        res.json({ campaigns });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// Get pending campaign staff requests
router.get('/campaign-requests', async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT sc.*,
                    u.full_name as staff_name,
                    u.staff_role,
                    c.name as campaign_name,
                    z.name as zilla_name,
                    t.name as thana_name,
                    sc.created_at as requested_at
             FROM staff_campaigns sc
             JOIN users u ON sc.staff_id = u.id
             JOIN campaigns c ON sc.campaign_id = c.id
             LEFT JOIN zillas z ON c.location_zilla = z.id
             LEFT JOIN thanas t ON c.location_thana = t.id
             WHERE sc.request_status = 'requested'
             ORDER BY sc.created_at DESC`
        );

        res.json({ requests });
    } catch (error) {
        console.error('Get campaign requests error:', error);
        res.status(500).json({ error: 'Failed to fetch campaign requests' });
    }
});

// Approve campaign staff request
router.post('/campaign-requests/approve', async (req, res) => {
    try {
        const { staff_id, campaign_id } = req.body;

        if (!staff_id || !campaign_id) {
            return res.status(400).json({ error: 'staff_id and campaign_id are required' });
        }

        await db.query(
            'UPDATE staff_campaigns SET request_status = ? WHERE staff_id = ? AND campaign_id = ?',
            ['approved', staff_id, campaign_id]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'CAMPAIGN_REQUEST_APPROVED', 'staff_campaign', campaign_id, `Staff ${staff_id} approved for campaign`]
        );

        res.json({ message: 'Campaign request approved successfully' });
    } catch (error) {
        console.error('Approve campaign request error:', error);
        res.status(500).json({ error: 'Failed to approve campaign request' });
    }
});

// Reject campaign staff request
router.post('/campaign-requests/reject', async (req, res) => {
    try {
        const { staff_id, campaign_id } = req.body;

        if (!staff_id || !campaign_id) {
            return res.status(400).json({ error: 'staff_id and campaign_id are required' });
        }

        await db.query(
            'DELETE FROM staff_campaigns WHERE staff_id = ? AND campaign_id = ? AND request_status = ?',
            [staff_id, campaign_id, 'pending']
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'CAMPAIGN_REQUEST_REJECTED', 'staff_campaign', campaign_id, `Staff ${staff_id} rejected for campaign`]
        );

        res.json({ message: 'Campaign request rejected successfully' });
    } catch (error) {
        console.error('Reject campaign request error:', error);
        res.status(500).json({ error: 'Failed to reject campaign request' });
    }
});

// Manually assign staff to campaign (admin override)
router.post('/campaigns/assign-staff', async (req, res) => {
    try {
        const { staff_id, campaign_id } = req.body;

        if (!staff_id || !campaign_id) {
            return res.status(400).json({ error: 'staff_id and campaign_id are required' });
        }

        // Check if staff exists and is approved
        const [staff] = await db.query(
            'SELECT * FROM users WHERE id = ? AND is_staff = TRUE AND staff_status = ?',
            [staff_id, 'approved']
        );

        if (staff.length === 0) {
            return res.status(404).json({ error: 'Staff not found or not approved' });
        }

        // Check if already assigned
        const [existing] = await db.query(
            'SELECT * FROM staff_campaigns WHERE staff_id = ? AND campaign_id = ?',
            [staff_id, campaign_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Staff already assigned to this campaign' });
        }

        // Insert with approved status (admin assignment)
        await db.query(
            'INSERT INTO staff_campaigns (staff_id, campaign_id, request_status) VALUES (?, ?, ?)',
            [staff_id, campaign_id, 'approved']
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'STAFF_ASSIGNED_BY_ADMIN', 'staff_campaign', campaign_id, `Staff ${staff_id} manually assigned to campaign`]
        );

        res.json({ message: 'Staff assigned to campaign successfully' });
    } catch (error) {
        console.error('Assign staff to campaign error:', error);
        res.status(500).json({ error: 'Failed to assign staff to campaign' });
    }
});

module.exports = router;

// Add blood to storage
router.post('/blood-storage/add', async (req, res) => {
    try {
        const { zilla_id, blood_type, units } = req.body;

        if (!zilla_id || !blood_type || !units) {
            return res.status(400).json({ error: 'zilla_id, blood_type, and units are required' });
        }

        if (units <= 0) {
            return res.status(400).json({ error: 'Units must be greater than 0' });
        }

        // Update blood storage
        await db.query(
            'UPDATE blood_storage SET units_available = units_available + ? WHERE zilla_id = ? AND blood_type = ?',
            [units, zilla_id, blood_type]
        );

        // Log the addition
        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'BLOOD_STORAGE_ADDED', 'blood_storage', zilla_id, `Added ${units} unit(s) of ${blood_type} to blood bank`]
        );

        res.json({
            message: `Successfully added ${units} unit(s) of ${blood_type} to blood bank`,
            units_added: units
        });
    } catch (error) {
        console.error('Add blood storage error:', error);
        res.status(500).json({ error: 'Failed to add blood to storage' });
    }
});


// Suspend/Ban user
router.post('/users/:id/suspend', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { reason } = req.body;

        // Get user info
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // 1. Cancel all blood requests where user is the receiver
        const [receiverRequests] = await db.query(
            `SELECT id FROM blood_requests 
             WHERE receiver_id = ? AND status NOT IN ('completed', 'cancelled')`,
            [userId]
        );

        for (const req of receiverRequests) {
            await db.query(
                `UPDATE blood_requests 
                 SET status = 'cancelled', cancellation_reason = ? 
                 WHERE id = ?`,
                [`Receiver account banned: ${reason || 'Account suspended'}`, req.id]
            );
        }

        // 2. Reallocate blood requests where user is the donor
        const [donorRequests] = await db.query(
            `SELECT * FROM blood_requests 
             WHERE allocated_donor_id = ? AND status NOT IN ('completed', 'cancelled')`,
            [userId]
        );

        for (const req of donorRequests) {
            // Try to find another eligible donor
            const [eligibleDonors] = await db.query(
                `SELECT u.id FROM users u
                 WHERE u.is_donor = TRUE 
                 AND u.blood_type = ?
                 AND u.is_suspended = FALSE
                 AND (u.last_donation_date IS NULL OR u.last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 90 DAY))
                 AND (u.address_thana = ? OR u.address_zilla = ?)
                 AND u.id != ?
                 AND u.id NOT IN (
                     SELECT allocated_donor_id 
                     FROM blood_requests 
                     WHERE allocated_donor_id IS NOT NULL 
                     AND status IN ('pending', 'allocated', 'crossmatch_passed')
                 )
                 ORDER BY 
                    CASE WHEN u.address_thana = ? THEN 1 ELSE 2 END,
                    RAND()
                 LIMIT 1`,
                [req.blood_type, req.request_thana, req.request_zilla, userId, req.request_thana]
            );

            if (eligibleDonors.length > 0) {
                // Reallocate to new donor
                await db.query(
                    'UPDATE blood_requests SET allocated_donor_id = ? WHERE id = ?',
                    [eligibleDonors[0].id, req.id]
                );

                await db.query(
                    'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
                    [req.user.userId, 'REQUEST_REALLOCATED', 'blood_request', req.id, `Reallocated from banned donor ${userId} to donor ${eligibleDonors[0].id}`]
                );
            } else {
                // Check blood bank
                const [bloodBankStock] = await db.query(
                    'SELECT units_available FROM blood_storage WHERE zilla_id = ? AND blood_type = ?',
                    [req.request_zilla, req.blood_type]
                );

                if (bloodBankStock.length > 0 && bloodBankStock[0].units_available > 0) {
                    // Allocate from blood bank
                    await db.query(
                        'UPDATE blood_requests SET allocated_donor_id = NULL WHERE id = ?',
                        [req.id]
                    );

                    await db.query(
                        'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
                        [req.user.userId, 'BLOOD_BANK_ALLOCATED', 'blood_request', req.id, `Reallocated from banned donor ${userId} to blood bank`]
                    );
                } else {
                    // Cancel request
                    await db.query(
                        `UPDATE blood_requests 
                         SET status = 'cancelled', cancellation_reason = ? 
                         WHERE id = ?`,
                        [`Donor banned and no replacement available: ${reason || 'Account suspended'}`, req.id]
                    );
                }
            }
        }

        // 3. Suspend the user
        await db.query(
            'UPDATE users SET is_suspended = TRUE WHERE id = ?',
            [userId]
        );

        // Log the suspension
        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'USER_SUSPENDED', 'user', userId, reason || 'User account suspended']
        );

        res.json({
            message: 'User suspended successfully',
            cancelled_receiver_requests: receiverRequests.length,
            reallocated_donor_requests: donorRequests.length
        });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ error: 'Failed to suspend user' });
    }
});


// Create staff account (not admin)
router.post('/create-staff', async (req, res) => {
    try {
        const { email, phone, password, full_name, address_thana, address_zilla, blood_type } = req.body;

        if (!email || !phone || !password || !full_name || !address_thana || !address_zilla || !blood_type) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email exists
        const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Check if phone exists
        const [existingPhone] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
            return res.status(409).json({ error: 'Phone already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert staff (is_admin = FALSE, is_staff = TRUE)
        const [result] = await db.query(
            `INSERT INTO users (email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_admin, is_staff, staff_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, TRUE, ?)`,
            [email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, 'approved']
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'STAFF_CREATED', 'user', result.insertId, `New staff created: ${email}`]
        );

        res.status(201).json({ message: 'Staff account created successfully' });
    } catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({ error: 'Failed to create staff account' });
    }
});
