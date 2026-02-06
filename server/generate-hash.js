const bcrypt = require('bcryptjs');

async function generateHash() {
    const hash = await bcrypt.hash('Password123', 10);
    console.log('Password: Password123');
    console.log('Hash:', hash);
}

generateHash();
