
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Generate a secure random password
function generateSecurePassword(length = 12) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Generate UUID
function generateUUID() {
  return crypto.randomUUID();
}

async function createAdminUser() {
  const password = generateSecurePassword(16);
  const hashedPassword = await bcrypt.hash(password, 12);
  const userId = generateUUID();
  const email = `admin-${Date.now()}@findermeister.com`;
  
  console.log('\n=== NEW ADMIN USER CREATED ===');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('User ID:', userId);
  console.log('Hashed Password:', hashedPassword);
  console.log('\n=== SQL INSERT STATEMENT ===');
  console.log(`INSERT INTO users (id, email, password, first_name, last_name, role, is_verified, is_banned, created_at) VALUES ('${userId}', '${email}', '${hashedPassword}', 'Admin', 'User', 'admin', true, false, '${new Date().toISOString()}');`);
  console.log('\n=== SAVE THESE CREDENTIALS SECURELY ===');
  
  // Also save to a file for backup
  const fs = require('fs');
  const credentials = {
    email: email,
    password: password,
    userId: userId,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync('new-admin-credentials.json', JSON.stringify(credentials, null, 2));
  console.log('\nCredentials also saved to: new-admin-credentials.json');
}

createAdminUser().catch(console.error);
