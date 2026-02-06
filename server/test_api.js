const db = require('./config/db');
require('dotenv').config();

async function testAPI() {
    try {
        console.log('=== TESTING API QUERY ===\n');

        // Simulate the exact API call
        const blood_type = 'AB+';
        const thana_id = 24; // Mirpur Model
        const zilla_id = 1;  // Dhaka

        console.log(`Parameters: blood_type=${blood_type}, thana_id=${thana_id}, zilla_id=${zilla_id}\n`);

        // Run the EXACT query from requests.js line 16-24
        const [donors] = await db.query(
            `SELECT COUNT(*) as count FROM users 
             WHERE is_donor = TRUE 
             AND blood_type = ?
             AND (address_thana = ? OR address_zilla = ?)
             AND is_suspended = FALSE
             AND (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 90 DAY))`,
            [blood_type, thana_id, zilla_id]
        );

        console.log(`Result: ${donors[0].count} eligible donors\n`);

        // Also get the actual users
        const [users] = await db.query(
            `SELECT id, full_name, blood_type, address_thana, address_zilla FROM users 
             WHERE is_donor = TRUE 
             AND blood_type = ?
             AND (address_thana = ? OR address_zilla = ?)
             AND is_suspended = FALSE
             AND (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 90 DAY))`,
            [blood_type, thana_id, zilla_id]
        );

        console.log('Eligible Users:');
        users.forEach(u => {
            console.log(`  - ${u.full_name} (ID: ${u.id}, Blood: ${u.blood_type}, Thana: ${u.address_thana}, Zilla: ${u.address_zilla})`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testAPI();
