const db = require('./config/db');
require('dotenv').config();

async function checkData() {
    try {
        console.log('=== CHECKING DATABASE DATA ===\n');

        // 1. Check all AB+ donors
        const [abDonors] = await db.query(
            `SELECT id, full_name, blood_type, address_thana, address_zilla, is_donor, is_suspended, last_donation_date 
             FROM users 
             WHERE blood_type = 'AB+'`
        );

        console.log(`Total AB+ users: ${abDonors.length}`);
        abDonors.forEach(u => {
            console.log(`  - ${u.full_name} (ID: ${u.id})`);
            console.log(`    is_donor: ${u.is_donor}, Thana: ${u.address_thana}, Zilla: ${u.address_zilla}`);
            console.log(`    suspended: ${u.is_suspended}, last_donation: ${u.last_donation_date}`);
        });

        console.log('\n=== TESTING QUERY WITH STRING PARAMS ===');
        // Test with string params (like from URL)
        const [result1] = await db.query(
            `SELECT COUNT(*) as count FROM users 
             WHERE is_donor = TRUE 
             AND blood_type = ?
             AND (address_thana = ? OR address_zilla = ?)
             AND is_suspended = FALSE
             AND (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 90 DAY))`,
            ['AB+', '24', '1']  // String params
        );
        console.log(`With string params ('24', '1'): ${result1[0].count} donors`);

        console.log('\n=== TESTING QUERY WITH INT PARAMS ===');
        // Test with int params
        const [result2] = await db.query(
            `SELECT COUNT(*) as count FROM users 
             WHERE is_donor = TRUE 
             AND blood_type = ?
             AND (address_thana = ? OR address_zilla = ?)
             AND is_suspended = FALSE
             AND (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 90 DAY))`,
            ['AB+', 24, 1]  // Int params
        );
        console.log(`With int params (24, 1): ${result2[0].count} donors`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkData();
