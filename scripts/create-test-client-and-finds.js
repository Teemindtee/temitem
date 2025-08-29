
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function createTestClientAndFinds() {
  try {
    console.log('Creating test client account...');
    
    // 1. Register test client
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testclient@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Client',
        role: 'client'
      })
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      console.error('Registration failed:', error);
      return;
    }

    const { token, user } = await registerResponse.json();
    console.log('✅ Test client created successfully:', user.email);

    // 2. Create first find
    console.log('\nCreating first find...');
    const find1Response = await fetch(`${BASE_URL}/api/client/finds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Find a Professional Logo Designer',
        description: 'I need a creative logo designer to create a modern, minimalist logo for my tech startup. The logo should be versatile and work well in both digital and print formats. Must have experience with tech companies and provide 3-5 concept variations.',
        category: 'Design',
        budgetMin: '15000',
        budgetMax: '35000',
        timeframe: '1 week',
        location: 'Remote/Online',
        requirements: 'Portfolio required, must have Adobe Creative Suite experience, provide vector files'
      })
    });

    if (!find1Response.ok) {
      const error = await find1Response.json();
      console.error('First find creation failed:', error);
      return;
    }

    const find1 = await find1Response.json();
    console.log('✅ First find created:', find1.title);

    // 3. Create second find
    console.log('\nCreating second find...');
    const find2Response = await fetch(`${BASE_URL}/api/client/finds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Social Media Marketing Expert Needed',
        description: 'Looking for an experienced social media marketer to help grow my Instagram and TikTok presence. Need someone who can create engaging content, manage posting schedules, and increase follower engagement. Must understand current trends and have proven results.',
        category: 'Marketing',
        budgetMin: '25000',
        budgetMax: '50000',
        timeframe: '1 month',
        location: 'Lagos, Nigeria',
        requirements: 'Proven track record with social media growth, content creation skills, knowledge of Instagram and TikTok algorithms'
      })
    });

    if (!find2Response.ok) {
      const error = await find2Response.json();
      console.error('Second find creation failed:', error);
      return;
    }

    const find2 = await find2Response.json();
    console.log('✅ Second find created:', find2.title);

    console.log('\n🎉 Test client and finds created successfully!');
    console.log('\nAccount Details:');
    console.log('Email:', user.email);
    console.log('Password: password123');
    console.log('\nFind IDs:');
    console.log('Find 1:', find1.id);
    console.log('Find 2:', find2.id);
    
    // Save token for future use
    const fs = require('fs');
    fs.writeFileSync('test_client_token.txt', token);
    console.log('\n💾 Client token saved to test_client_token.txt');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createTestClientAndFinds();
