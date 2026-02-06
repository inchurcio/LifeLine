const db = require('./config/db');
require('dotenv').config();

async function checkBloodTypes() {
    try {
        // Get all unique blood types in the database
        const [types] = await db.query(`SELECT DISTINCT blood_type FROM users ORDER BY blood_type`);

        console.log('Blood types in database:');
        types.forEach(t => {
            console.log(`  '${t.blood_type}' (length: ${t.blood_type.length})`);
        });

        // Check for AB+ specifically
        const [abPlus] = await db.query(`SELECT COUNT(*) as count FROM users WHERE blood_type = 'AB+'`);
        console.log(`\nUsers with blood_type = 'AB+': ${abPlus[0].count}`);

        // Check for AB with space
        const [abSpace] = await db.query(`SELECT COUNT(*) as count FROM users WHERE blood_type = 'AB '`);
        console.log(`Users with blood_type = 'AB ': ${abSpace[0].count}`);

        // Check AB+ donors
        const [abPlusDonors] = await db.query(`SELECT COUNT(*) as count FROM users WHERE blood_type = 'AB+' AND is_donor = TRUE`);
        console.log(`AB+ donors: ${abPlusDonors[0].count}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkBloodTypes();
