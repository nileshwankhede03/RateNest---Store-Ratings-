require('dotenv').config();

const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const password = await bcrypt.hash('Admin@123', 10);

  await db.query(
    `INSERT INTO users
        (name, email, password, address, role)
        VALUES (?, ?, ?, ?, 'ADMIN')
        ON DUPLICATE KEY UPDATE role = 'ADMIN'`,
    [
      'System Administrator Account',
      'admin@gmail.com',
      password,
      'Admin Office',
    ],
  );

  console.log('Admin created successfully');
  await db.end();
}

createAdmin().catch(console.error);
