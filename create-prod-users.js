const axios = require('axios');

// Replace this with your actual Render URL
const PROD_URL = 'https://your-app-name.onrender.com'; // Update this!

const users = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'password123'
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@example.com',
    password: 'password123'
  },
  {
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah@example.com',
    password: 'password123'
  }
];

const createUsers = async () => {
  console.log('🚀 Creating users in production...');
  console.log('URL:', PROD_URL);
  
  for (const user of users) {
    try {
      console.log(`Creating user: ${user.firstName} ${user.lastName}...`);
      
      const response = await axios.post(`${PROD_URL}/api/auth/register`, user);
      
      if (response.data.success) {
        console.log(`✅ Created: ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`❌ Failed: ${user.firstName} ${user.lastName} - ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Error creating ${user.firstName} ${user.lastName}:`, error.response?.data?.message || error.message);
    }
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Check your production app');
  console.log('2. Go to Water Quality → Create New Record');
  console.log('3. Check if the testers dropdown is populated');
};

createUsers(); 