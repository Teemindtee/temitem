// Setup for Node.js/backend tests

// Mock TextEncoder and TextDecoder for Node.js environment
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

// Mock console to avoid noisy output during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('Warning:')) return; // Suppress React warnings
  originalConsoleError(...args);
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://test:test@localhost:5432/test';