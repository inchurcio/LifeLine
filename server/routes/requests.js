const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get available donors count (before creating request)
router.get('/available-donors', verifyToken, requireRole('receiver'), async (req, res) => {
    try {
        let { blood_type, thana_id, zilla_id } = req.query;

        if (!blood_type || !thana_id || !zilla_id) {
            return res.status(400).json({ error: 'blood_type, thana_id, and zilla_id are required' });
        }

        // Convert to integers to ensure proper comparison
        thana_id = parseInt(thana_id);
        zilla_id = parseInt(zilla_id);

        // Find eligible donors (matching the same logic as POST /requests)
        // Exclude: requester, donors with active allocations, suspended donors
        const [donors] = await db.query(
            `SELECT COUNT(*) as count FROM users u
             WHERE u.is_donor = TRUE 
             AND u.blood_type = ?
             AND (u.address_thana = ? OR u.address_zilla = ?)
             AND u.is_suspended = FALSE
             AND (u.last_donation_date IS NULL OR u.last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 90 DAY))
             AND u.id != ?
             AND u.id NOT IN (
                 SELECT allocated_donor_id 
                 FROM blood_requests 
                 WHERE allocated_donor_id IS NOT NULL 
                 AND status IN ('pending', 'allocated', 'crossmatch_passed')
             )`,
            [blood_type, thana_id, zilla_id, req.user.userId]
        );

        res.json({
            available_donors: donors[0].count,
            blood_type,
            location: { thana_id, zilla_id }
        });
    } catch (error) {
        console.error('Get available donors error:', error);
        res.status(500).json({ error: 'Failed to fetch available donors' });
    }
});

// Create blood request
router.post('/', verifyToken, requireRole('receiver'), async (req, res) => {
    try {
        const { blood_type, units, date_needed, request_thana, request_zilla, notes } = req.body;

        if (!blood_type || !units || !date_needed || !request_thana || !request_zilla) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate date
        const requestDate = new Date(date_needed);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Ignore time component to allow "today"

        if (requestDate < today) {
            return res.status(400).json({ error: 'Date needed cannot be in the past' });
        }

        // FIRST: Check if there are ENOUGH eligible donors BEFORE creating the request
        // Find eligible donors: same blood type, >90 days since last donation, same location
        // Exclude: the requester themselves, donors with active allocations, suspended donors
        // IMPORTANT: Fetch as many donors as units requested (1 donor per unit)
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
             LIMIT ?`,
            [blood_type, request_thana, request_zilla, req.user.userId, request_thana, units]
        );

        // Check if we have enough donors for the requested units
        let unitsFromDonors = eligibleDonors.length;
        let unitsFromBloodBank = 0;

        if (eligibleDonors.length < units) {
            // Not enough donors - check blood bank inventory
            const unitsNeeded = units - eligibleDonors.length;

            const [bloodBankStock] = await db.query(
                'SELECT units_available FROM blood_storage WHERE zilla_id = ? AND blood_type = ?',
                [request_zilla, blood_type]
            );

            const availableInBloodBank = bloodBankStock.length > 0 ? bloodBankStock[0].units_available : 0;

            if (availableInBloodBank >= unitsNeeded) {
                // Blood bank has enough stock to cover the shortage
                unitsFromBloodBank = unitsNeeded;
                console.log(`Blood bank fallback: ${unitsFromBloodBank} unit(s) from blood bank, ${unitsFromDonors} from donors`);
            } else {
                // Not enough in blood bank either
                return res.status(400).json({
                    error: 'Insufficient blood available',
                    message: `Only ${eligibleDonors.length} eligible donor(s) and ${availableInBloodBank} unit(s) in blood bank available, but ${units} unit(s) requested.`,
                    available_donors: eligibleDonors.length,
                    available_blood_bank: availableInBloodBank,
                    units_requested: units
                });
            }
        }

        // If we reach here, we have enough blood (from donors and/or blood bank)
        // Create separate requests for each unit
        const createdRequests = [];

        for (let i = 0; i < units; i++) {
            const isFromBloodBank = i >= unitsFromDonors; // First units from donors, remaining from blood bank

            // Create individual request for this unit
            const notesSuffix = isFromBloodBank ? ' [Blood Bank]' : '';
            const [result] = await db.query(
                `INSERT INTO blood_requests (receiver_id, blood_type, units, date_needed, request_thana, request_zilla, notes)
                 VALUES (?, ?, 1, ?, ?, ?, ?)`,
                [req.user.userId, blood_type, date_needed, request_thana, request_zilla,
                notes ? `${notes} (Unit ${i + 1} of ${units})${notesSuffix}` : `Unit ${i + 1} of ${units}${notesSuffix}`]
            );

            const requestId = result.insertId;

            if (isFromBloodBank) {
                // Blood bank allocation - set status to 'allocated' with NULL donor
                await db.query(
                    'UPDATE blood_requests SET allocated_donor_id = NULL, status = ? WHERE id = ?',
                    ['allocated', requestId]
                );

                // Log blood bank allocation
                await db.query(
                    'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
                    [req.user.userId, 'BLOOD_BANK_ALLOCATED', 'blood_request', requestId, `Blood allocated from blood bank inventory`]
                );

                createdRequests.push({ request_id: requestId, donor_id: null, unit_number: i + 1, from_blood_bank: true });
            } else {
                // Donor allocation
                const donorId = eligibleDonors[i].id;

                await db.query(
                    'UPDATE blood_requests SET allocated_donor_id = ?, status = ? WHERE id = ?',
                    [donorId, 'allocated', requestId]
                );

                // Log allocation
                await db.query(
                    'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
                    [req.user.userId, 'REQUEST_ALLOCATED', 'blood_request', requestId, `Unit ${i + 1}/${units} allocated to donor ${donorId}`]
                );

                createdRequests.push({ request_id: requestId, donor_id: donorId, unit_number: i + 1, from_blood_bank: false });
            }
        }

        // Log request creation (after all units are created)
        const donorCount = createdRequests.filter(r => !r.from_blood_bank).length;
        const bloodBankCount = createdRequests.filter(r => r.from_blood_bank).length;
        const allocationDetails = bloodBankCount > 0
            ? `${donorCount} from donors, ${bloodBankCount} from blood bank`
            : `${donorCount} from donors`;

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'REQUEST_CREATED', 'blood_request', createdRequests[0].request_id, `Blood request created for ${units} unit(s) of ${blood_type} - ${allocationDetails}`]
        );

        res.status(201).json({
            message: `Blood request created successfully - ${units} unit(s) allocated (${allocationDetails})`,
            requests: createdRequests,
            total_units: units,
            allocated: true
        });

    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: 'Failed to create blood request' });
    }
});

// Get user's requests
router.get('/', verifyToken, async (req, res) => {
    try {
        // Get requests where user is either receiver or allocated donor
        const query = `
            SELECT br.*, 
                   donor.full_name as donor_name,
                   receiver.full_name as receiver_name,
                   z.name as zilla_name,
                   t.name as thana_name
            FROM blood_requests br
            LEFT JOIN users donor ON br.allocated_donor_id = donor.id
            LEFT JOIN users receiver ON br.receiver_id = receiver.id
            LEFT JOIN zillas z ON br.request_zilla = z.id
            LEFT JOIN thanas t ON br.request_thana = t.id
            WHERE br.receiver_id = ? OR br.allocated_donor_id = ?
            ORDER BY br.created_at DESC
        `;

        const [requests] = await db.query(query, [req.user.userId, req.user.userId]);

        res.json({ requests });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get single request details
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT br.*,
                    receiver.full_name as receiver_name, receiver.phone as receiver_phone,
                    donor.full_name as donor_name, donor.phone as donor_phone,
                    z.name as zilla_name,
                    t.name as thana_name
             FROM blood_requests br
             LEFT JOIN users receiver ON br.receiver_id = receiver.id
             LEFT JOIN users donor ON br.allocated_donor_id = donor.id
             LEFT JOIN zillas z ON br.request_zilla = z.id
             LEFT JOIN thanas t ON br.request_thana = t.id
             WHERE br.id = ?`,
            [req.params.id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const request = requests[0];

        // Check authorization
        if (request.receiver_id !== req.user.userId &&
            request.allocated_donor_id !== req.user.userId &&
            !req.user.is_staff && !req.user.is_admin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ request });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// Cancel request
router.put('/:id/cancel', verifyToken, requireRole('receiver'), async (req, res) => {
    try {
        const { cancellation_reason } = req.body;

        // Verify ownership
        const [requests] = await db.query(
            'SELECT * FROM blood_requests WHERE id = ? AND receiver_id = ?',
            [req.params.id, req.user.userId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found or access denied' });
        }

        const request = requests[0];

        if (request.status === 'completed' || request.status === 'cancelled') {
            return res.status(400).json({ error: 'Cannot cancel completed or already cancelled request' });
        }

        await db.query(
            'UPDATE blood_requests SET status = ?, cancellation_reason = ? WHERE id = ?',
            ['cancelled', cancellation_reason, req.params.id]
        );

        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, 'REQUEST_CANCELLED', 'blood_request', req.params.id, cancellation_reason]
        );

        res.json({ message: 'Request cancelled successfully' });
    } catch (error) {
        console.error('Cancel request error:', error);
        res.status(500).json({ error: 'Failed to cancel request' });
    }
});

module.exports = router;
