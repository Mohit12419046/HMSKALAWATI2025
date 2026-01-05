const http = require('http');

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
async function testLogin() {
  console.log('\n🧪 Testing Login...');
  try {
    const loginData = {
      email: 'test@example.com',
      password: '123456'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, loginData);

    if (response.statusCode === 200 && response.body.status === 'ok') {
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testAddVital() {
  console.log('\n🧪 Testing Add Vital Signs...');
  try {
    const vitalData = {
      user_id: 1,
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
        'Content-Type': 'application/json'
      }
    }, vitalData);

    if (response.statusCode === 201) {
      console.log('✅ Add vital signs successful');
      return true;
    } else {
      console.log('❌ Add vital signs failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Add vital signs error:', error.message);
    return false;
  }
}

async function testGetVitals() {
  console.log('\n🧪 Testing Get Vital Signs...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/vitals/1',
      method: 'GET'
    });

    if (response.statusCode === 200 && Array.isArray(response.body)) {
      console.log(`✅ Get vital signs successful, found ${response.body.length} records`);
      return true;
    } else {
      console.log('❌ Get vital signs failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Get vital signs error:', error.message);
    return false;
  }
}

async function testAddSymptom() {
  console.log('\n🧪 Testing Add Symptom...');
  try {
    const symptomData = {
      user_id: 1,
      name: 'Headache',
      system: 'Neurological',
      severity: 3,
      notes: 'Mild headache'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/symptoms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, symptomData);

    if (response.statusCode === 201) {
      console.log('✅ Add symptom successful');
      return true;
    } else {
      console.log('❌ Add symptom failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Add symptom error:', error.message);
    return false;
  }
}

async function testGetSymptoms() {
  console.log('\n🧪 Testing Get Symptoms...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/symptoms/1',
      method: 'GET'
    });

    if (response.statusCode === 200 && Array.isArray(response.body)) {
      console.log(`✅ Get symptoms successful, found ${response.body.length} records`);
      return true;
    } else {
      console.log('❌ Get symptoms failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Get symptoms error:', error.message);
    return false;
  }
}

async function testAddMedication() {
  console.log('\n🧪 Testing Add Medication...');
  try {
    const medData = {
      user_id: 1,
      name: 'Aspirin',
      dose: '100mg',
      schedule: 'Once daily',
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      notes: 'For headache'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/meds',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, medData);

    if (response.statusCode === 201) {
      console.log('✅ Add medication successful');
      return true;
    } else {
      console.log('❌ Add medication failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Add medication error:', error.message);
    return false;
  }
}

async function testGetMedications() {
  console.log('\n🧪 Testing Get Medications...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/meds/1',
      method: 'GET'
    });

    if (response.statusCode === 200 && Array.isArray(response.body)) {
      console.log(`✅ Get medications successful, found ${response.body.length} records`);
      return true;
    } else {
      console.log('❌ Get medications failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Get medications error:', error.message);
    return false;
  }
}

async function testAddAppointment() {
  console.log('\n🧪 Testing Add Appointment...');
  try {
    const apptData = {
      user_id: 1,
      doctor: 'Dr. Smith',
      datetime: '2024-01-15T10:00:00',
      type: 'Consultation',
      notes: 'Regular checkup'
    };

    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, apptData);

    if (response.statusCode === 201) {
      console.log('✅ Add appointment successful');
      return true;
    } else {
      console.log('❌ Add appointment failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Add appointment error:', error.message);
    return false;
  }
}

async function testGetAppointments() {
  console.log('\n🧪 Testing Get Appointments...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments/1',
      method: 'GET'
    });

    if (response.statusCode === 200 && Array.isArray(response.body)) {
      console.log(`✅ Get appointments successful, found ${response.body.length} records`);
      return true;
    } else {
      console.log('❌ Get appointments failed:', response.statusCode, response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Get appointments error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Flask API Tests for Health Management System...\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test login
  results.total++;
  if (await testLogin()) results.passed++;
  else results.failed++;

  // Test vitals
  results.total++;
  if (await testAddVital()) results.passed++;
  else results.failed++;

  results.total++;
  if (await testGetVitals()) results.passed++;
  else results.failed++;

  // Test symptoms
  results.total++;
  if (await testAddSymptom()) results.passed++;
  else results.failed++;

  results.total++;
  if (await testGetSymptoms()) results.passed++;
  else results.failed++;

  // Test medications
  results.total++;
  if (await testAddMedication()) results.passed++;
  else results.failed++;

  results.total++;
  if (await testGetMedications()) results.passed++;
  else results.failed++;

  // Test appointments
  results.total++;
  if (await testAddAppointment()) results.passed++;
  else results.failed++;

  results.total++;
  if (await testGetAppointments()) results.passed++;
  else results.failed++;

  return results;
}

// Run tests and display results
runTests().then((results) => {
  console.log('\n📊 Flask API Test Results Summary:');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All Flask API tests passed! The backend is working correctly.');
  } else {
    console.log('\n⚠️ Some Flask API tests failed. Please check the implementation.');
  }

  process.exit(results.failed === 0 ? 0 : 1);
}).catch((error) => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
