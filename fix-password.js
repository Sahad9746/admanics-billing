// Script to update user password with bcrypt hash
const { createClient } = require('@sanity/client');
const bcrypt = require('bcryptjs');

const client = createClient({
  projectId: 'iapwkj9i',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'skB22pgk6d9BRrJPtqeBbaIVgyWbhfySIfZq9jpZKFp0qk3zfrtTwpwX5gop9LlaGgZrIsdL7MikPj14MuRFOTS52S1nJCkEprLrIZ3VkqbuFfxCXnHbX2mxiasprzpJ0l9EGY1SEt3QlaHGZnXYZo0gXf67vtx3T8uy2IeV9pKl6UQyYo0U'
});

async function updatePassword() {
  const email = 'sahad@admanics.com';
  const plainPassword = 'admanics@321';
  
  console.log('\n=== Updating User Password ===');
  console.log('Email:', email);
  console.log('Plain password:', plainPassword);
  
  try {
    // Find user
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:', user.name);
    
    // Hash password
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    console.log('🔐 Hashed password:', hashedPassword);
    
    // Update user
    await client
      .patch(user._id)
      .set({ password: hashedPassword })
      .commit();
    
    console.log('✅ Password updated successfully!');
    console.log('\nYou can now login with:');
    console.log('   Email:', email);
    console.log('   Password:', plainPassword);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('===========================\n');
}

updatePassword();
