const bcrypt = require('bcryptjs');

// Generate hash for Password123
bcrypt.hash('Password123', 10, (err, hash) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('='.repeat(60));
        console.log('PASSWORD HASH FOR: Password123');
        console.log('='.repeat(60));
        console.log(hash);
        console.log('='.repeat(60));
    }
});
