// Test script to check if user exists in Sanity
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'iapwkj9i',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'skB22pgk6d9BRrJPtqeBbaIVgyWbhfySIfZq9jpZKFp0qk3zfrtTwpwX5gop9LlaGgZrIsdL7MikPj14MuRFOTS52S1nJCkEprLrIZ3VkqbuFfxCXnHbX2mxiasprzpJ0l9EGY1SEt3QlaHGZnXYZo0gXf67vtx3T8uy2IeV9pKl6UQyYo0U'
});

async function checkUser() {
  const email = process.argv[2] || 'sahad@admanics.com';
  
  console.log('\n=== Checking User in Sanity ===');
  console.log('Email:', email);
  
  try {
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );
    
    if (user) {
      console.log('\n✅ User found!');
      console.log('   - ID:', user._id);
      console.log('   - Name:', user.name);
      console.log('   - Email:', user.email);
      console.log('   - Role:', user.role);
      console.log('   - Password (first 20 chars):', user.password?.substring(0, 20) + '...');
      console.log('\n💡 Password should start with: $2b$10$ (bcrypt hash)');
    } else {
      console.log('\n❌ User not found!');
      console.log('   Try checking the exact email in Sanity Studio');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
  
  console.log('===========================\n');
}

checkUser();
