const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { 
    userId: 'admin-test-123', 
    role: 'admin' 
  }, 
  'your-secret-key-here', // This should match your JWT_SECRET
  { 
    expiresIn: '24h' 
  }
);

console.log('Admin token:', token);

// Test the token by setting it in localStorage via console:
console.log('\nTo use this token, run in browser console:');
console.log(`localStorage.setItem('findermeister_token', '${token}');`);
console.log('Then refresh the page.');