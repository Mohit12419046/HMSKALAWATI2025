const http = require('http');

const BASE_URL = 'http://localhost:5000';
let authToken = null;

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testLandingPage() {
  console.log('\n🧪 Testing Landing Page...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Landing page accessible');
      return true;
    } else {
      console.log('❌ Landing page failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Landing page error:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n🧪 Testing User Registration...');
  try {
    const userData = {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'test123',
      role: 'admin',
      department: 'IT'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, userData);

    if (response.statusCode === 201) {
      console.log('✅ User registration successful');
      return true;
    } else if (response.statusCode === 400) {
      console.log('⚠️ User already exists (expected for repeated tests)');
      return true;
    } else {
      console.log('❌ User registration failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ User registration error:', error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🧪 Testing User Login...');
  try {
    const loginData = {
      email: 'admin@test.com',
      password: 'test123'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, loginData);

    if (response.statusCode === 200 && response.body.token) {
      authToken = response.body.token;
      console.log('✅ User login successful, token received');
      return true;
    } else {
      console.log('❌ User login failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ User login error:', error.message);
    return false;
  }
}

async function testPatientCreation() {
  console.log('\n🧪 Testing Patient Creation...');
  try {
    const patientData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      dateOfBirth: '1985-05-15',
      gender: 'male',
      address: '123 Main St, City, State',
      bloodType: 'O+',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567891',
        relationship: 'wife'
      }
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/patients',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, patientData);

    if (response.statusCode === 201) {
      console.log('✅ Patient creation successful');
      return response.body.id;
    } else {
      console.log('❌ Patient creation failed:', response.statusCode, response.body);
      return null;
    }
  } catch (error) {
    console.log('❌ Patient creation error:', error.message);
    return null;
  }
}

async function testPatientRetrieval() {
  console.log('\n🧪 Testing Patient Retrieval...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/patients',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.statusCode === 200 && Array.isArray(response.body)) {
      console.log(`✅ Patient retrieval successful, found ${response.body.length} patients`);
      return true;
    } else {
      console.log('❌ Patient retrieval failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Patient retrieval error:', error.message);
    return false;
  }
}

async function testAdmissionCreation(patientId) {
  console.log('\n🧪 Testing Admission Creation...');
  try {
    const admissionData = {
      patientId: patientId,
      room: '101',
      diagnosis: 'Pneumonia',
      admittingDoctor: 'Dr. Smith',
      ward: 'General Medicine'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admissions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, admissionData);

    if (response.statusCode === 201) {
      console.log('✅ Admission creation successful');
      return response.body.id;
    } else {
      console.log('❌ Admission creation failed:', response.statusCode, response.body);
      return null;
    }
  } catch (error) {
    console.log('❌ Admission creation error:', error.message);
    return null;
  }
}

async function testMedicationCreation(patientId) {
  console.log('\n🧪 Testing Medication Creation...');
  try {
    const medicationData = {
      patientId: patientId,
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3 times daily',
      route: 'oral',
      startDate: new Date().toISOString().split('T')[0]
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/medications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, medicationData);

    if (response.statusCode === 201) {
      console.log('✅ Medication creation successful');
      return true;
    } else {
      console.log('❌ Medication creation failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Medication creation error:', error.message);
    return false;
  }
}

async function testVitalSignsCreation(patientId) {
  console.log('\n🧪 Testing Vital Signs Creation...');
  try {
    const vitalData = {
      userId: patientId,
      type: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/vitals',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, vitalData);

    if (response.statusCode === 201) {
      console.log('✅ Vital signs creation successful');
      return true;
    } else {
      console.log('❌ Vital signs creation failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Vital signs creation error:', error.message);
    return false;
  }
}

async function testAppointmentCreation(patientId) {
  console.log('\n🧪 Testing Appointment Creation...');
  try {
    const appointmentData = {
      userId: patientId,
      type: 'Consultation',
      datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      department: 'General Medicine',
      notes: 'Follow-up consultation'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, appointmentData);

    if (response.statusCode === 201) {
      console.log('✅ Appointment creation successful');
      return true;
    } else {
      console.log('❌ Appointment creation failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Appointment creation error:', error.message);
    return false;
  }
}

async function testAnalyticsOverview() {
  console.log('\n🧪 Testing Analytics Overview...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/overview',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.statusCode === 200) {
      console.log('✅ Analytics overview successful');
      console.log('   Data:', JSON.stringify(response.body, null, 2));
      return true;
    } else {
      console.log('❌ Analytics overview failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Analytics overview error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Health Management System API Tests...\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test landing page
  results.total++;
  if (await testLandingPage()) results.passed++;
  else results.failed++;

  // Test user registration
  results.total++;
  if (await testUserRegistration()) results.passed++;
  else results.failed++;

  // Test user login
  results.total++;
  if (await testUserLogin()) results.passed++;
  else results.failed++;

  // Skip further tests if login failed
  if (!authToken) {
    console.log('\n❌ Cannot continue tests without authentication token');
    return results;
  }

  // Test patient operations
  results.total++;
  const patientId = await testPatientCreation();
  if (patientId) results.passed++;
  else results.failed++;

  results.total++;
  if (await testPatientRetrieval()) results.passed++;
  else results.failed++;

  // Test admission creation
  if (patientId) {
    results.total++;
    const admissionId = await testAdmissionCreation(patientId);
    if (admissionId) results.passed++;
    else results.failed++;
  }

  // Test medication creation
  if (patientId) {
    results.total++;
    if (await testMedicationCreation(patientId)) results.passed++;
    else results.failed++;
  }

  // Test vital signs creation
  if (patientId) {
    results.total++;
    if (await testVitalSignsCreation(patientId)) results.passed++;
    else results.failed++;
  }

  // Test appointment creation
  if (patientId) {
    results.total++;
    if (await testAppointmentCreation(patientId)) results.passed++;
    else results.failed++;
  }

  // Test analytics
  results.total++;
  if (await testAnalyticsOverview()) results.passed++;
  else results.failed++;

  return results;
}

// Run tests and display results
runTests().then((results) => {
  console.log('\n📊 Test Results Summary:');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! The Health Management System is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }

  process.exit(results.failed === 0 ? 0 : 1);
}).catch((error) => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
