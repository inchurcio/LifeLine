const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('Password123', 10);
// Write to a file
const fs = require('fs');
fs.writeFileSync('hash.txt', hash);
console.log('Hash written to hash.txt');
