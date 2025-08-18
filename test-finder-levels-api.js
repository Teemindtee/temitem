const express = require('express');
const { storage } = require('./server/storage.ts');

// Test the finder levels functionality directly
async function testFinderLevels() {
  try {
    console.log('Testing finder levels...');
    const levels = await storage.getFinderLevels();
    console.log('✓ Successfully fetched', levels.length, 'finder levels');
    
    // Test creating a level
    const testLevel = {
      name: 'Test Level',
      description: 'Test description',
      minEarnedAmount: '2000',
      minJobsCompleted: 10,
      minReviewPercentage: 85,
      icon: 'Search',
      color: '#8b5cf6',
      order: 4,
      isActive: true
    };
    
    const created = await storage.createFinderLevel(testLevel);
    console.log('✓ Successfully created test level:', created.id);
    
    // Clean up
    await storage.deleteFinderLevel(created.id);
    console.log('✓ Successfully deleted test level');
    
    console.log('✓ All finder level operations working correctly!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testFinderLevels();