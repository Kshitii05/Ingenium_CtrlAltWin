// Test script to verify medical endpoints
require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testEndpoints() {
  console.log('🧪 Testing Medical Module Endpoints...\n');

  // Test 1: Health check
  try {
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', health.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Create a test user first
  try {
    console.log('\n2. Creating test user...');
    const userResponse = await axios.post(`${API_URL}/auth/register`, {
      aadhaar_number: '123456789012',
      name: 'Test User',
      dob: '1990-01-01',
      gender: 'Male',
      phone: '9876543210',
      address: 'Test Address',
      email: 'testuser@test.com',
      password: 'password123'
    });
    console.log('✅ Test user created');

    // Login to get token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'testuser@test.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    console.log('✅ User logged in, token obtained');

    // Test 3: Check medical account status
    console.log('\n3. Checking medical account status...');
    const statusResponse = await axios.get(`${API_URL}/medical/account/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Status check passed:', statusResponse.data);

    // Test 4: Create medical account
    console.log('\n4. Creating medical account...');
    const medicalResponse = await axios.post(
      `${API_URL}/medical/account/create`,
      {
        email: 'medical@test.com',
        password: 'password123',
        blood_group: 'O+'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Medical account created:', medicalResponse.data);

    // Test 5: Medical login
    console.log('\n5. Testing medical login...');
    const medicalLogin = await axios.post(`${API_URL}/medical/login`, {
      email: 'medical@test.com',
      password: 'password123'
    });
    console.log('✅ Medical login successful');
    const medicalToken = medicalLogin.data.token;

    // Test 6: Get medical profile
    console.log('\n6. Getting medical profile...');
    const profile = await axios.get(`${API_URL}/medical/profile`, {
      headers: { Authorization: `Bearer ${medicalToken}` }
    });
    console.log('✅ Profile retrieved:', profile.data.profile.medical_id);

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.log('\n❌ Test failed:', error.response?.data || error.message);
  }
}

testEndpoints();
