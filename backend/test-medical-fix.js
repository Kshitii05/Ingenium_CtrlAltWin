// Test Medical Account Creation After Fix
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

let userToken = '';
let medicalToken = '';

async function testMedicalAccountCreation() {
  try {
    console.log('\n🧪 Testing Medical Account Creation Fix...\n');

    // Step 1: Register a new user
    console.log('1️⃣ Registering new user...');
    const timestamp = Date.now();
    const registerData = {
      email: `testuser${timestamp}@example.com`,
      password: 'password123',
      name: 'Test User',
      aadhaar_number: `${timestamp}`.slice(0, 12)
    };

    const registerRes = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('✅ User registered:', registerRes.data.message);
    userToken = registerRes.data.token;

    // Step 2: Login with the user
    console.log('\n2️⃣ Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ User logged in');
    userToken = loginRes.data.token;

    // Step 3: Check medical account status
    console.log('\n3️⃣ Checking medical account status...');
    const checkRes = await axios.get(`${API_URL}/medical/check-account`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Medical account status:', checkRes.data);

    // Step 4: Create medical account
    console.log('\n4️⃣ Creating medical account...');
    const medicalData = {
      medical_email: `medical${timestamp}@example.com`,
      medical_password: 'medicalpass123',
      blood_group: 'O+',
      gender: 'male',
      date_of_birth: '1990-01-01',
      phone_number: '9876543210',
      emergency_contact_name: 'Emergency Contact',
      emergency_contact_phone: '9876543211',
      emergency_contact_relation: 'spouse'
    };

    const createRes = await axios.post(`${API_URL}/medical/create-account`, medicalData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Medical account created successfully!');
    console.log('   Medical ID:', createRes.data.medicalAccount.medical_id);
    console.log('   Medical Email:', createRes.data.medicalAccount.medical_email);

    // Step 5: Medical login
    console.log('\n5️⃣ Testing medical login...');
    const medicalLoginRes = await axios.post(`${API_URL}/medical/login`, {
      medical_email: medicalData.medical_email,
      medical_password: medicalData.medical_password
    });
    console.log('✅ Medical login successful');
    console.log('   Token received:', medicalLoginRes.data.token ? 'Yes' : 'No');
    medicalToken = medicalLoginRes.data.token;

    // Step 6: Get medical profile
    console.log('\n6️⃣ Fetching medical profile...');
    const profileRes = await axios.get(`${API_URL}/medical/profile`, {
      headers: { Authorization: `Bearer ${medicalToken}` }
    });
    console.log('✅ Medical profile retrieved:');
    console.log('   Medical ID:', profileRes.data.profile.medical_id);
    console.log('   Blood Group:', profileRes.data.profile.blood_group);
    console.log('   Gender:', profileRes.data.profile.gender);

    console.log('\n✅✅✅ ALL TESTS PASSED! Medical account creation is working perfectly! ✅✅✅\n');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

testMedicalAccountCreation();
