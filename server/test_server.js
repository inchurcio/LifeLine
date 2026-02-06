const express = require('express');
const app = express();
const db = require('./config/db');
require('dotenv').config();

// Test the exact API endpoint
app.get('/test', async (req, res) => {
    try {
        const blood_type = 'AB+';
        const thana_id = '24';
        const zilla_id = '1';

        console.log('Query params:', { blood_type, thana_id, zilla_id });

        const [donors] = await db.query(
            `SELECT COUNT(*) as count FROM users 
             WHERE is_donor = TRUE 
             AND blood_type = ?
             AND (address_thana = ? OR address_zilla = ?)
             AND is_suspended = FALSE
             AND (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 90 DAY))`,
            [blood_type, thana_id, zilla_id]
        );

        res.json({
            available_donors: donors[0].count,
            blood_type,
            location: { thana_id, zilla_id }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('Test server running on http://localhost:3001/test');
    console.log('Testing AB+ in Mirpur Model (thana_id=24, zilla_id=1)');
});
