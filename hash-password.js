// Simple script to hash a password for Sanity user creation
const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('\n=== Password Hash Generator ===');
console.log('Password:', password);
console.log('Hashed:', hash);
console.log('\nCopy the hashed value above and paste it into the "password" field in Sanity Studio.');
console.log('===========================\n');
