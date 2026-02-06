const db = require('./config/db');
require('dotenv').config();

async function checkUser() {
    try {
        // Check the user "inchurcio"
        const [users] = await db.query("SELECT * FROM users WHERE full_name LIKE '%inchurcio%' OR email LIKE '%inchurcio%'");

        if (users.length === 0) {
            console.log('User "inchurcio" not found');
            process.exit();
        }

        const user = users[0];
        console.log('User Details:');
        console.log(`  Name: ${user.full_name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  is_donor: ${user.is_donor}`);
        console.log(`  is_receiver: ${user.is_receiver}`);
        console.log(`  is_admin: ${user.is_admin}`);
        console.log(`  is_staff: ${user.is_staff}`);
        console.log(`  Blood Type: ${user.blood_type}`);
        console.log(`  Address Thana: ${user.address_thana}`);
        console.log(`  Address Zilla: ${user.address_zilla}`);

        if (!user.is_receiver) {
            console.log('\n⚠️  WARNING: This user does NOT have receiver role enabled!');
            console.log('The /requests/available-donors endpoint requires receiver role.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkUser();
