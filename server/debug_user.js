const db = require('./config/db');
const fs = require('fs');
require('dotenv').config();

async function debugUser() {
    const logFile = 'd:/2/debug_output.txt';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    try {
        fs.writeFileSync(logFile, '=== DEBUGGING DONOR ELIGIBILITY ===\n');

        // 1. Find Thana ID for Mirpur Model
        const [thanas] = await db.query("SELECT id, name, zilla_id FROM thanas WHERE name = 'Mirpur Model'");
        if (thanas.length === 0) {
            log("ERROR: Thana 'Mirpur Model' NOT FOUND in database.");
            process.exit();
        }
        const thana = thanas[0];
        log(`\nThana Found: ${thana.name}`);
        log(`  - Thana ID: ${thana.id}`);
        log(`  - Zilla ID: ${thana.zilla_id}`);

        // 2. Find the user
        const [users] = await db.query("SELECT * FROM users WHERE full_name LIKE '%Mohammad Nihal%'");
        if (users.length === 0) {
            log("\nERROR: User 'Mohammad Nihal Ibne Nasir' NOT FOUND in database.");
            process.exit();
        }

        const user = users[0];
        log(`\nUser Found: ${user.full_name}`);
        log(`  - User ID: ${user.id}`);
        log(`  - Blood Type: ${user.blood_type}`);
        log(`  - Is Donor: ${user.is_donor}`);
        log(`  - Address Thana: ${user.address_thana}`);
        log(`  - Address Zilla: ${user.address_zilla}`);
        log(`  - Is Suspended: ${user.is_suspended}`);
        log(`  - Last Donation Date: ${user.last_donation_date}`);

        // 3. Run the EXACT API query
        const blood_type = 'AB+';
        const thana_id = thana.id;
        const zilla_id = thana.zilla_id;

        log(`\n=== RUNNING API QUERY ===`);
        log(`Parameters: blood_type=${blood_type}, thana_id=${thana_id}, zilla_id=${zilla_id}`);

        const [result] = await db.query(
            `SELECT COUNT(*) as count FROM users 
             WHERE is_donor = TRUE 
             AND blood_type = ?
             AND (address_thana = ? OR address_zilla = ?)
             AND is_suspended = FALSE
             AND (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 90 DAY))`,
            [blood_type, thana_id, zilla_id]
        );

        log(`\nAPI Query Result: ${result[0].count} eligible donors`);

        // 4. Check each condition individually
        log(`\n=== CHECKING INDIVIDUAL CONDITIONS ===`);

        const [check1] = await db.query(`SELECT COUNT(*) as count FROM users WHERE is_donor = TRUE AND full_name LIKE '%Mohammad Nihal%'`);
        log(`1. is_donor = TRUE: ${check1[0].count > 0 ? 'PASS' : 'FAIL'}`);

        const [check2] = await db.query(`SELECT COUNT(*) as count FROM users WHERE blood_type = ? AND full_name LIKE '%Mohammad Nihal%'`, [blood_type]);
        log(`2. blood_type = '${blood_type}': ${check2[0].count > 0 ? 'PASS' : 'FAIL'}`);

        const [check3] = await db.query(`SELECT COUNT(*) as count FROM users WHERE (address_thana = ? OR address_zilla = ?) AND full_name LIKE '%Mohammad Nihal%'`, [thana_id, zilla_id]);
        log(`3. Location match (thana=${thana_id} OR zilla=${zilla_id}): ${check3[0].count > 0 ? 'PASS' : 'FAIL'}`);

        const [check4] = await db.query(`SELECT COUNT(*) as count FROM users WHERE is_suspended = FALSE AND full_name LIKE '%Mohammad Nihal%'`);
        log(`4. is_suspended = FALSE: ${check4[0].count > 0 ? 'PASS' : 'FAIL'}`);

        const [check5] = await db.query(`SELECT COUNT(*) as count FROM users WHERE (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(CURDATE(), INTERVAL 90 DAY)) AND full_name LIKE '%Mohammad Nihal%'`);
        log(`5. 90-day cooldown: ${check5[0].count > 0 ? 'PASS' : 'FAIL'}`);

        log(`\n=== DIAGNOSIS ===`);
        if (result[0].count === 0) {
            log('The user is NOT being counted by the API query.');
            log('Check which condition is failing above.');
        } else {
            log('The user IS being counted. The issue may be in the frontend.');
        }

        log('\n=== DEBUG COMPLETE ===');
        process.exit();
    } catch (error) {
        log(`\nERROR: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

debugUser();
