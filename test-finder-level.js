// Quick test script to check finder levels functionality
const testFinderLevel = async () => {
  try {
    // Test getting levels
    const response = await fetch('http://localhost:5000/api/admin/finder-levels', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    // Test creating a level
    const createResponse = await fetch('http://localhost:5000/api/admin/finder-levels', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Level',
        description: 'Test finder level',
        minEarnedAmount: '1000',
        minJobsCompleted: 5,
        minReviewPercentage: 80,
        icon: 'User',
        color: '#ff0000',
        order: 1,
        isActive: true
      })
    });
    
    console.log('Create Status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Create Response:', createData);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testFinderLevel();