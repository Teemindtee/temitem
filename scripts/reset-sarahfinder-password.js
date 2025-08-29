
#!/usr/bin/env node

const bcrypt = require('bcrypt');
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { users } = require('../shared/schema');
const { eq } = require('drizzle-orm');

// Database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function resetSarahfinderPassword() {
  try {
    // Generate a new password
    const newPassword = 'Sarah' + Math.random().toString(36).slice(-8) + '!';
    console.log('Generated new password for Sarahfinder:', newPassword);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Find and update Sarahfinder's password
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.firstName, 'Sarah'))
      .returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName });
    
    if (result.length > 0) {
      const user = result[0];
      console.log('\n✅ Password reset successful!');
      console.log('User Details:');
      console.log('- Name:', user.firstName, user.lastName);
      console.log('- Email:', user.email);
      console.log('- New Password:', newPassword);
      console.log('\nPlease share these credentials securely with the user.');
    } else {
      console.log('❌ No user found with name "Sarah"');
      
      // Let's search for users with "sarah" in their name or email (case insensitive)
      const searchResults = await db
        .select({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(
          eq(users.firstName.toLowerCase(), 'sarah')
        );
        
      if (searchResults.length > 0) {
        console.log('\nFound similar users:');
        searchResults.forEach(user => {
          console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

resetSarahfinderPassword();
