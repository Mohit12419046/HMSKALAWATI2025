// app.js - minimal SPA
const API = "http://127.0.0.1:5000/api";
let userId = null;
let user = null;
const main = document.getElementById("main");
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    // Add active class to clicked button
    btn.classList.add("active");
    loadPage(btn.dataset.page);
  });
});

// Initialize app with login check
document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
});

function checkLoginStatus() {
  // Check if user is logged in (stored in localStorage)
  const storedUser = localStorage.getItem('hms_user');
  if (storedUser) {
    user = JSON.parse(storedUser);
    userId = user.id;
    loadPage("dashboard");
  } else {
    showLoginPage();
  }
}

function showLoginPage() {
  main.innerHTML = `
    <div class="login-container">
      <div class="login-form">
        <h2>Health Management System</h2>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit" class="primary">Login</button>
        </form>
        <div id="loginMessage"></div>
      </div>
    </div>
  `;

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
      email: formData.get("email"),
      password: formData.get("password")
    };

    try {
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();
      if (result.status === "ok") {
        user = result.user;
        userId = user.id;
        localStorage.setItem('hms_user', JSON.stringify(user));
        loadPage("dashboard");
      } else {
        document.getElementById("loginMessage").innerHTML = `<p class="error">${result.message}</p>`;
      }
    } catch (error) {
      document.getElementById("loginMessage").innerHTML = `<p class="error">Login failed. Please try again.</p>`;
    }
  });
}

function logout() {
  user = null;
  userId = null;
  localStorage.removeItem('hms_user');
  showLoginPage();
}

function loadPage(page){
  if(page === "dashboard") return renderDashboard();
  if(page === "patients") return renderPatients();
  if(page === "admissions") return renderAdmissions();
  if(page === "vitals") return renderVitals();
  if(page === "symptoms") return renderSymptoms();
  if(page === "meds") return renderMeds();
  if(page === "appts") return renderAppts();
  if(page === "inventory") return renderInventory();
  if(page === "billing") return renderBilling();
  if(page === "reports") return renderReports();
  if(page === "ai-reports") return renderAIHealthReports();
}

// Always start with dashboard - login button will show login form when clicked
if (typeof jest === 'undefined') loadPage("dashboard");
// ---------- Dashboard ---------
async function renderDashboard(){
  main.innerHTML = `
    <!-- Emergency Alerts -->
    <div class="emergency-alerts" id="emergencyAlerts">
      <!-- Alerts will be loaded here -->
    </div>

    <!-- Dashboard Content -->
    <div class="dashboard-grid">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon patients">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3 id="totalPatients">--</h3>
            <p>Total Patients</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon admissions">
            <i class="fas fa-hospital"></i>
          </div>
          <div class="stat-content">
            <h3 id="totalAdmissions">--</h3>
            <p>Current Admissions</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon appointments">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <h3 id="todayAppointments">--</h3>
            <p>Today's Appointments</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon revenue">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <h3 id="monthlyRevenue">--</h3>
            <p>Monthly Revenue</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button class="action-btn primary" onclick="loadPage('patients')">
            <i class="fas fa-user-plus"></i>
            <span>Add Patient</span>
          </button>
          <button class="action-btn secondary" onclick="loadPage('admissions')">
            <i class="fas fa-hospital"></i>
            <span>New Admission</span>
          </button>
          <button class="action-btn success" onclick="loadPage('appts')">
            <i class="fas fa-calendar-plus"></i>
            <span>Book Appointment</span>
          </button>
          <button class="action-btn warning" onclick="loadPage('inventory')">
            <i class="fas fa-box-open"></i>
            <span>Update Inventory</span>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list" id="recentActivity">
          <div class="activity-item">
            <div class="activity-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="activity-content">
              <p>New patient registered</p>
              <small>2 minutes ago</small>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="activity-content">
              <p>Appointment scheduled</p>
              <small>15 minutes ago</small>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">
              <i class="fas fa-pills"></i>
            </div>
            <div class="activity-content">
              <p>Medication prescribed</p>
              <small>1 hour ago</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Overview -->
      <div class="department-overview">
        <h2>Department Overview</h2>
        <div class="department-grid">
          <div class="department-card">
            <div class="dept-icon cardiology">
              <i class="fas fa-heartbeat"></i>
            </div>
            <div class="dept-content">
              <h4>Cardiology</h4>
              <p>12 Active Patients</p>
            </div>
          </div>
          <div class="department-card">
            <div class="dept-icon neurology">
              <i class="fas fa-brain"></i>
            </div>
            <div class="dept-content">
              <h4>Neurology</h4>
              <p>8 Active Patients</p>
            </div>
          </div>
          <div class="department-card">
            <div class="dept-icon emergency">
              <i class="fas fa-ambulance"></i>
            </div>
            <div class="dept-content">
              <h4>Emergency</h4>
              <p>5 Active Cases</p>
            </div>
          </div>
          <div class="department-card">
            <div class="dept-icon general">
              <i class="fas fa-stethoscope"></i>
            </div>
            <div class="dept-content">
              <h4>General Medicine</h4>
              <p>15 Active Patients</p>
            </div>
          </div>
        </div>
      </div>


    </div>`;

  // Load dashboard stats
  loadDashboardStats();
  // Load emergency alerts
  loadEmergencyAlerts();
}

async function loadDashboardStats() {
  try {
    const [patientsRes, admissionsRes, appointmentsRes] = await Promise.all([
      fetch(`${API}/patients`),
      fetch(`${API}/admissions`),
      fetch(`${API}/appointments`)
    ]);

    const patients = await patientsRes.json();
    const admissions = await admissionsRes.json();
    const appointments = await appointmentsRes.json();

    document.getElementById('totalPatients').textContent = patients.length;
    document.getElementById('totalAdmissions').textContent = admissions.length;
    document.getElementById('todayAppointments').textContent = appointments.length;
    document.getElementById('monthlyRevenue').textContent = '$45,230';
  } catch (error) {
    console.log('Dashboard stats loading...');
  }
}

async function loadEmergencyAlerts() {
  try {
    const [vitalsRes, symptomsRes] = await Promise.all([
      fetch(`${API}/vitals`),
      fetch(`${API}/symptoms`)
    ]);

    const vitals = await vitalsRes.json();
    const symptoms = await symptomsRes.json();

    const alerts = [];

    // Check vitals for critical conditions
    vitals.forEach(vital => {
      if (vital.type === 'Blood Pressure') {
        const [systolic, diastolic] = vital.value.split('/').map(Number);
        if (systolic >= 180 || diastolic >= 120) {
          alerts.push({
            patient: vital.patient?.name || 'Unknown',
            type: 'Critical Blood Pressure',
            value: vital.value,
            time: vital.recordedAt
          });
        }
      } else if (vital.type === 'Temperature' && parseFloat(vital.value) >= 104) {
        alerts.push({
          patient: vital.patient?.name || 'Unknown',
          type: 'High Fever',
          value: vital.value + ' ' + vital.unit,
          time: vital.recordedAt
        });
      } else if (vital.type === 'Heart Rate' && parseInt(vital.value) >= 150) {
        alerts.push({
          patient: vital.patient?.name || 'Unknown',
          type: 'Tachycardia',
          value: vital.value + ' ' + vital.unit,
          time: vital.recordedAt
        });
      }
    });

    // Check symptoms for high severity
    symptoms.forEach(symptom => {
      if (symptom.severity >= 8) {
        alerts.push({
          patient: symptom.patient?.name || 'Unknown',
          type: 'Severe Symptom',
          value: symptom.name + ' (Severity: ' + symptom.severity + ')',
          time: symptom.reportedAt
        });
      }
    });

    const alertsContainer = document.getElementById('emergencyAlerts');
    if (alerts.length > 0) {
      alertsContainer.innerHTML = alerts.map(alert => `
        <div class="emergency-alert">
          <div class="alert-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="alert-content">
            <h4>${alert.patient}</h4>
            <p>${alert.type}: ${alert.value}</p>
            <small>${new Date(alert.time).toLocaleString()}</small>
          </div>
        </div>
      `).join('');
    } else {
      alertsContainer.innerHTML = '<p>No critical alerts at this time.</p>';
    }
  } catch (error) {
    console.log('Emergency alerts loading...');
  }
}
// ---------- Patients ---------
function renderPatients(){
  main.innerHTML = `
    <div class="card">
      <h2>Patient Registration & Admission</h2>
      <div id="patientFormsContainer">
        <div class="patient-form-section" data-patient-index="0">
          <h3>Patient 1</h3>
          <form class="patient-form form-row">
            <input name="name" placeholder="Full Name" required>
            <input name="email" type="email" placeholder="Email">
            <input name="phone" placeholder="Phone">
            <input name="dateOfBirth" type="date" required>
            <select name="gender" required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select name="bloodType">
              <option value="">Blood Type</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
            </select>
            <textarea name="allergies" placeholder="Allergies (one per line)" rows="2"></textarea>
            <textarea name="chronicConditions" placeholder="Chronic Conditions (one per line)" rows="2"></textarea>
            <input name="emergencyContactName" placeholder="Emergency Contact Name">
            <input name="emergencyContactPhone" placeholder="Emergency Contact Phone">
            <input name="emergencyContactRelationship" placeholder="Relationship">
            <input name="insuranceProvider" placeholder="Insurance Provider">
            <input name="insurancePolicyNumber" placeholder="Policy Number">
            <input name="insuranceCoverage" placeholder="Coverage Details">
            <textarea name="medicalHistory" placeholder="Medical History (one per line)" rows="3"></textarea>
            <textarea name="currentMedications" placeholder="Current Medications (one per line)" rows="2"></textarea>
            <input name="preferredDoctor" placeholder="Preferred Doctor">
            <input name="registrationDate" type="date" readonly value="${new Date().toISOString().split('T')[0]}">
          </form>
          <div class="family-members-section">
            <h4>Family Members Accompanying Patient</h4>
            <div class="family-members-list" data-patient-index="0">
              <!-- Family members will be added here -->
            </div>
            <button type="button" class="add-family-member-btn secondary" data-patient-index="0">Add Family Member</button>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" id="addAnotherPatientBtn" class="secondary">Add Another Patient</button>
        <button type="button" id="submitAllPatientsBtn" class="primary">Register Patients & Forward to Admission</button>
      </div>
      <div id="patientlist" class="small"></div>
    </div>`;

  // Initialize patient counter
  let patientCounter = 1;

  // Add another patient functionality
  document.getElementById("addAnotherPatientBtn").addEventListener("click", () => {
    patientCounter++;
    addPatientForm(patientCounter - 1);
  });

  // Submit all patients functionality
  document.getElementById("submitAllPatientsBtn").addEventListener("click", async () => {
    await submitAllPatients();
  });

  // Initialize family member functionality for first patient
  initializeFamilyMemberFunctionality(0);

  loadPatientList();
}

function addPatientForm(index) {
  const container = document.getElementById("patientFormsContainer");
  const patientFormHTML = `
    <div class="patient-form-section" data-patient-index="${index}">
      <h3>Patient ${index + 1}</h3>
      <form class="patient-form form-row">
        <input name="name" placeholder="Full Name" required>
        <input name="email" type="email" placeholder="Email">
        <input name="phone" placeholder="Phone">
        <input name="dateOfBirth" type="date" required>
        <select name="gender" required>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select name="bloodType">
          <option value="">Blood Type</option>
          <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
          <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
        </select>
        <textarea name="allergies" placeholder="Allergies (one per line)" rows="2"></textarea>
        <textarea name="chronicConditions" placeholder="Chronic Conditions (one per line)" rows="2"></textarea>
        <input name="emergencyContactName" placeholder="Emergency Contact Name">
        <input name="emergencyContactPhone" placeholder="Emergency Contact Phone">
        <input name="emergencyContactRelationship" placeholder="Relationship">
        <input name="insuranceProvider" placeholder="Insurance Provider">
        <input name="insurancePolicyNumber" placeholder="Policy Number">
        <input name="insuranceCoverage" placeholder="Coverage Details">
        <textarea name="medicalHistory" placeholder="Medical History (one per line)" rows="3"></textarea>
        <textarea name="currentMedications" placeholder="Current Medications (one per line)" rows="2"></textarea>
        <input name="preferredDoctor" placeholder="Preferred Doctor">
        <input name="registrationDate" type="date" readonly value="${new Date().toISOString().split('T')[0]}">
      </form>
      <div class="family-members-section">
        <h4>Family Members Accompanying Patient</h4>
        <div class="family-members-list" data-patient-index="${index}">
          <!-- Family members will be added here -->
        </div>
        <button type="button" class="add-family-member-btn secondary" data-patient-index="${index}">Add Family Member</button>
      </div>
    </div>`;

  container.insertAdjacentHTML('beforeend', patientFormHTML);
  initializeFamilyMemberFunctionality(index);
}

function initializeFamilyMemberFunctionality(patientIndex) {
  const addFamilyBtn = document.querySelector(`.add-family-member-btn[data-patient-index="${patientIndex}"]`);
  const familyList = document.querySelector(`.family-members-list[data-patient-index="${patientIndex}"]`);

  addFamilyBtn.addEventListener("click", () => {
    const familyMemberIndex = familyList.children.length;
    const familyMemberHTML = `
      <div class="family-member-item" data-family-index="${familyMemberIndex}">
        <input name="familyName_${patientIndex}_${familyMemberIndex}" placeholder="Family Member Name" required>
        <input name="familyRelation_${patientIndex}_${familyMemberIndex}" placeholder="Relationship to Patient" required>
        <input name="familyPhone_${patientIndex}_${familyMemberIndex}" placeholder="Phone Number">
        <button type="button" class="remove-family-member-btn danger" data-patient-index="${patientIndex}" data-family-index="${familyMemberIndex}">Remove</button>
      </div>`;

    familyList.insertAdjacentHTML('beforeend', familyMemberHTML);

    // Add remove functionality
    const removeBtn = familyList.querySelector(`.remove-family-member-btn[data-patient-index="${patientIndex}"][data-family-index="${familyMemberIndex}"]`);
    removeBtn.addEventListener("click", () => {
      removeBtn.closest('.family-member-item').remove();
    });
  });
}

async function submitAllPatients() {
  const patientSections = document.querySelectorAll('.patient-form-section');
  const patientsData = [];

  for (let i = 0; i < patientSections.length; i++) {
    const section = patientSections[i];
    const form = section.querySelector('.patient-form');
    const familyMembers = [];

    // Collect family members
    const familyList = section.querySelector('.family-members-list');
    const familyItems = familyList.querySelectorAll('.family-member-item');

    familyItems.forEach((item, familyIndex) => {
      const nameInput = item.querySelector(`input[name="familyName_${i}_${familyIndex}"]`);
      const relationInput = item.querySelector(`input[name="familyRelation_${i}_${familyIndex}"]`);
      const phoneInput = item.querySelector(`input[name="familyPhone_${i}_${familyIndex}"]`);

      if (nameInput && nameInput.value.trim()) {
        familyMembers.push({
          name: nameInput.value.trim(),
          relationship: relationInput.value.trim(),
          phone: phoneInput.value.trim()
        });
      }
    });

    // Validate form
    if (!form.checkValidity()) {
      alert(`Please fill in all required fields for Patient ${i + 1}`);
      return;
    }

    const patientData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      dateOfBirth: form.dateOfBirth.value,
      gender: form.gender.value,
      bloodType: form.bloodType.value,
      allergies: form.allergies.value ? form.allergies.value.split('\n').filter(a => a.trim()).map(a => a.trim()) : [],
      chronicConditions: form.chronicConditions.value ? form.chronicConditions.value.split('\n').filter(c => c.trim()).map(c => c.trim()) : [],
      emergencyContact: {
        name: form.emergencyContactName.value,
        phone: form.emergencyContactPhone.value,
        relationship: form.emergencyContactRelationship.value
      },
      insurance: {
        provider: form.insuranceProvider.value,
        policyNumber: form.insurancePolicyNumber.value,
        coverage: form.insuranceCoverage.value
      },
      medicalHistory: form.medicalHistory.value ? form.medicalHistory.value.split('\n').filter(h => h.trim()).map(h => h.trim()) : [],
      currentMedications: form.currentMedications.value ? form.currentMedications.value.split('\n').filter(m => m.trim()).map(m => m.trim()) : [],
      preferredDoctor: form.preferredDoctor.value,
      registrationDate: form.registrationDate.value,
      accompanyingFamily: familyMembers
    };

    patientsData.push(patientData);
  }

  if (patientsData.length === 0) {
    alert('No patients to register');
    return;
  }

  try {
    // Register all patients
    const patientPromises = patientsData.map(patient =>
      fetch(`${API}/patients`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patient)
      })
    );

    const patientResponses = await Promise.all(patientPromises);
    const patientResults = await Promise.all(patientResponses.map(res => res.json()));

    // Forward to admissions
    const admissionPromises = patientResults.map((result, index) => {
      if (result.id) {
        const admissionData = {
          patientId: result.id,
          ward: 'general', // Default ward
          room: 'TBA', // To Be Assigned
          bed: 'TBA',
          floor: '1',
          admissionType: 'elective',
          diagnosis: 'Initial assessment required',
          chiefComplaint: 'Patient registration',
          accompanyingFamily: patientsData[index].accompanyingFamily
        };

        return fetch(`${API}/admissions`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(admissionData)
        });
      }
    }).filter(Boolean);

    if (admissionPromises.length > 0) {
      await Promise.all(admissionPromises);
    }

    alert(`Successfully registered ${patientsData.length} patient(s) and forwarded to admission department!`);

    // Reset the form
    renderPatients();

  } catch (error) {
    console.error('Error registering patients:', error);
    alert('Error registering patients. Please try again.');
  }
}
async function loadPatientList(){
  const res = await fetch(`${API}/patients`);
  const data = await res.json();
  document.getElementById("patientlist").innerHTML = data.map(p=>`<div class="list-item"><strong>${p.name}</strong> — ${p.email || 'No email'}<div class="small">${p.phone || 'No phone'}</div></div>`).join("");
}
// ---------- Admissions ---------
function renderAdmissions(){
  main.innerHTML = `
    <div class="card">
      <h2>Admissions</h2>
      <form id="admissionForm" class="form-row">
        <select name="patientId" required><option value="">Select Patient</option></select>
        <select name="ward" required>
          <option value="">Select Ward</option>
          <option>general</option><option>icu</option><option>ccu</option><option>sicu</option><option>nicu</option><option>emergency</option><option>maternity</option>
        </select>
        <input name="room" placeholder="Room" required>
        <input name="bed" placeholder="Bed">
        <input name="floor" placeholder="Floor">
        <select name="admissionType">
          <option value="elective">Elective</option><option value="emergency">Emergency</option><option value="urgent">Urgent</option>
        </select>
        <input name="diagnosis" placeholder="Diagnosis" required>
        <input name="chiefComplaint" placeholder="Chief Complaint">
        <button class="primary">Admit Patient</button>
      </form>
      <div id="admissionlist" class="small"></div>
    </div>`;
  loadPatientOptions();
  document.getElementById("admissionForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = {
      patientId: f.patientId.value,
      ward: f.ward.value,
      room: f.room.value,
      bed: f.bed.value,
      floor: f.floor.value,
      admissionType: f.admissionType.value,
      diagnosis: f.diagnosis.value,
      chiefComplaint: f.chiefComplaint.value
    };
    await fetch(`${API}/admissions`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
    f.reset(); loadAdmissionList();
  });
  loadAdmissionList();
}
async function loadPatientOptions(){
  const res = await fetch(`${API}/patients`);
  const patients = await res.json();
  const select = document.querySelector('select[name="patientId"]');
  select.innerHTML = '<option value="">Select Patient</option>' + patients.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}
async function loadAdmissionList(){
  const res = await fetch(`${API}/admissions`);
  const data = await res.json();
  document.getElementById("admissionlist").innerHTML = data.map(a=>`<div class="list-item"><strong>${a.patient?.name || 'Unknown'}</strong> — ${a.ward} ${a.room}<div class="small">${a.diagnosis}</div></div>`).join("");
}
// ---------- Vitals ---------
function renderVitals(){
  main.innerHTML = `
    <div class="card"><h2>Vitals</h2>
      <form id="vitalForm" class="form-row">
        <select name="patientId" required><option value="">Select Patient</option></select>
        <select name="type" required>
          <option value="">Select Type</option>
          <option>Blood Pressure</option><option>Heart Rate</option><option>Temperature</option><option>Respiratory Rate</option><option>Oxygen Saturation</option><option>Weight</option><option>Height</option><option>BMI</option><option>Blood Glucose</option><option>Pain Level</option>
        </select>
        <input name="value" placeholder="Value" required>
        <input name="unit" placeholder="Unit" required>
        <select name="method">
          <option value="manual">Manual</option><option value="automatic">Automatic</option><option value="patient_reported">Patient Reported</option>
        </select>
        <select name="location">
          <option value="clinic">Clinic</option><option value="home">Home</option><option value="hospital">Hospital</option><option value="emergency">Emergency</option>
        </select>
        <select name="position">
          <option value="sitting">Sitting</option><option value="standing">Standing</option><option value="lying_down">Lying Down</option><option value="supine">Supine</option>
        </select>
        <button class="primary">Add Vital</button>
      </form>
      <div id="vlist" class="small"></div>
    </div>`;
  loadPatientOptions();
  document.getElementById("vitalForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = {
      patientId: f.patientId.value,
      type: f.type.value,
      value: f.value.value,
      unit: f.unit.value,
      method: f.method.value,
      location: f.location.value,
      position: f.position.value
    };
    await fetch(`${API}/vitals`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
    f.reset(); await loadVitalsList();
  });
  loadVitalsList();
}
async function loadVitalsList(){
  const res = await fetch(`${API}/vitals`);
  const data = await res.json();
  const container = document.getElementById("vlist");
  container.innerHTML = data.map(v => `<div class="list-item"><div><strong>${v.type}</strong> — ${v.value} ${v.unit}</div><div class="small">${v.recordedAt} (${v.patient?.name || 'Unknown'})</div></div>`).join("");
}
// ---------- Symptoms ---------
function renderSymptoms(){
  main.innerHTML = `
    <div class="card">
      <h2>Symptoms</h2>
      <form id="symForm" class="form-row">
        <select name="patientId" required><option value="">Select Patient</option></select>
        <input name="name" placeholder="Symptom name" required>
        <input name="description" placeholder="Description">
        <input name="severity" type="number" min="1" max="10" placeholder="severity 1-10" required>
        <select name="onset">
          <option value="gradual">Gradual</option><option value="sudden">Sudden</option>
        </select>
        <select name="frequency">
          <option value="intermittent">Intermittent</option><option value="constant">Constant</option><option value="occasional">Occasional</option>
        </select>
        <input name="location" placeholder="Location">
        <select name="category">
          <option value="general">General</option><option value="cardiovascular">Cardiovascular</option><option value="respiratory">Respiratory</option><option value="gastrointestinal">Gastrointestinal</option><option value="neurological">Neurological</option><option value="musculoskeletal">Musculoskeletal</option><option value="dermatological">Dermatological</option><option value="psychological">Psychological</option>
        </select>
        <button class="primary">Log Symptom</button>
      </form>
      <div id="slist" class="small"></div>
    </div>`;
  loadPatientOptions();
  document.getElementById("symForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = {
      patientId: f.patientId.value,
      name: f.name.value,
      description: f.description.value,
      severity: Number(f.severity.value),
      onset: f.onset.value,
      frequency: f.frequency.value,
      location: f.location.value,
      category: f.category.value
    };
    await fetch(`${API}/symptoms`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
    f.reset(); loadSymptomsList();
  });
  loadSymptomsList();
}
async function loadSymptomsList(){
  const res = await fetch(`${API}/symptoms`);
  const data = await res.json();
  const container = document.getElementById("slist");
  container.innerHTML = data.map(s=>`<div class="list-item"><div><strong>${s.name}</strong> (${s.patient?.name || 'Unknown'}) severity:${s.severity}</div><div class="small">${s.reportedAt}</div><div>${s.description || ''}</div></div>`).join("");
}
// ---------- Medications ---------
function renderMeds(){
  main.innerHTML = `
    <div class="card">
      <h2>Medications</h2>
      <form id="medForm" class="form-row">
        <select name="patientId" required><option value="">Select Patient</option></select>
        <input name="name" placeholder="Medication name" required>
        <input name="genericName" placeholder="Generic Name">
        <input name="dosage" placeholder="Dosage" required>
        <select name="route" required>
          <option value="">Select Route</option>
          <option>oral</option><option>intravenous</option><option>intramuscular</option><option>subcutaneous</option><option>topical</option><option>inhalation</option><option>rectal</option><option>ocular</option>
        </select>
        <input name="frequency" placeholder="Frequency" required>
        <input name="duration" placeholder="Duration">
        <input name="indication" placeholder="Indication">
        <input name="instructions" placeholder="Instructions">
        <input name="startDate" type="date" required>
        <input name="endDate" type="date">
        <button class="primary">Add Med</button>
      </form>
      <div id="medlist" class="small"></div>
    </div>`;
  loadPatientOptions();
  document.getElementById("medForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = {
      patientId: f.patientId.value,
      name: f.name.value,
      genericName: f.genericName.value,
      dosage: f.dosage.value,
      route: f.route.value,
      frequency: f.frequency.value,
      duration: f.duration.value,
      indication: f.indication.value,
      instructions: f.instructions.value,
      startDate: f.startDate.value,
      endDate: f.endDate.value
    };
    await fetch(`${API}/medications`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
    f.reset(); loadMedsList();
  });
  loadMedsList();
}
async function loadMedsList(){
  const res = await fetch(`${API}/medications`);
  const data = await res.json();
  document.getElementById("medlist").innerHTML = data.map(m=>`<div class="list-item"><strong>${m.name}</strong> ${m.dosage} — ${m.frequency}<div class="small">${m.patient?.name || 'Unknown'} | ${m.startDate}</div></div>`).join("");
}
// ---------- Appointments ---------
function renderAppts(){
  main.innerHTML = `
    <div class="card">
      <h2>Appointments</h2>
      <form id="apptForm" class="form-row">
        <select name="patientId" required><option value="">Select Patient</option></select>
        <input name="datetime" type="datetime-local" required>
        <input name="duration" type="number" placeholder="Duration (min)" value="30">
        <select name="type">
          <option value="consultation">Consultation</option><option value="follow-up">Follow-up</option><option value="check-up">Check-up</option><option value="emergency">Emergency</option><option value="procedure">Procedure</option><option value="therapy">Therapy</option>
        </select>
        <select name="priority">
          <option value="medium">Medium</option><option value="low">Low</option><option value="high">High</option><option value="urgent">Urgent</option>
        </select>
        <select name="department" required>
          <option value="">Select Department</option>
          <option>cardiology</option><option>neurology</option><option>orthopedics</option><option>emergency</option><option>general</option><option>dermatology</option><option>ophthalmology</option><option>ent</option>
        </select>
        <input name="room" placeholder="Room">
        <input name="chiefComplaint" placeholder="Chief Complaint">
        <input name="preparationInstructions" placeholder="Preparation Instructions">
        <button class="primary">Book</button>
      </form>
      <div id="applist" class="small"></div>
    </div>`;
  loadPatientOptions();
  document.getElementById("apptForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = {
      patientId: f.patientId.value,
      datetime: f.datetime.value,
      duration: Number(f.duration.value),
      type: f.type.value,
      priority: f.priority.value,
      department: f.department.value,
      room: f.room.value,
      chiefComplaint: f.chiefComplaint.value,
      preparationInstructions: f.preparationInstructions.value
    };
    await fetch(`${API}/appointments`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
    f.reset(); loadApptsList();
  });
  loadApptsList();
}
async function loadApptsList(){
  const res = await fetch(`${API}/appointments`);
  const data = await res.json();
  document.getElementById("applist").innerHTML = data.map(a=>`<div class="list-item"><strong>${a.patient?.name || 'Unknown'}</strong> — ${a.datetime} <div class="small">${a.department} | ${a.type}</div></div>`).join("");
}
// ---------- Inventory ---------
function renderInventory(){
  main.innerHTML = `
    <div class="card">
      <h2>Inventory</h2>
      <form id="inventoryForm" class="form-row">
        <input name="name" placeholder="Item Name" required>
        <input name="genericName" placeholder="Generic Name">
        <select name="category" required>
          <option value="">Select Category</option>
          <option>medication</option><option>medical_supplies</option><option>equipment</option><option>consumables</option><option>laboratory</option><option>surgical</option>
        </select>
        <input name="subcategory" placeholder="Subcategory">
        <input name="description" placeholder="Description">
        <input name="manufacturer" placeholder="Manufacturer">
        <input name="quantity" type="number" placeholder="Quantity" required>
        <select name="unit">
          <option value="pieces">Pieces</option><option value="tablets">Tablets</option><option value="capsules">Capsules</option><option value="ml">ml</option><option value="mg">mg</option><option value="units">Units</option><option value="boxes">Boxes</option><option value="bottles">Bottles</option>
        </select>
        <input name="costPrice" type="number" step="0.01" placeholder="Cost Price" required>
        <input name="sellingPrice" type="number" step="0.01" placeholder="Selling Price">
        <input name="expiryDate" type="date" placeholder="Expiry Date">
        <input name="batchNumber" placeholder="Batch Number">
        <input name="supplier" placeholder="Supplier">
        <input name="location" placeholder="Storage Location">
        <input name="reorderLevel" type="number" placeholder="Reorder Level">
        <input name="maximumStock" type="number" placeholder="Maximum Stock">
        <button class="primary">Add Item</button>
      </form>
      <div id="inventorylist" class="small"></div>
    </div>`;
  loadInventoryList();
}

async function loadInventoryList(){
  const res = await fetch(`${API}/inventory`);
  const data = await res.json();
  document.getElementById("inventorylist").innerHTML = data.map(i=>`<div class="list-item"><strong>${i.name}</strong> — ${i.quantity} ${i.unit}<div class="small">${i.category} | $${i.costPrice}</div></div>`).join("");
}
// ---------- Billing ---------
function renderBilling(){
  main.innerHTML = `
    <div class="card">
      <h2>Billing</h2>
      <form id="billingForm" class="form-row">
        <select name="patientId" required><option value="">Select Patient</option></select>
        <input name="invoiceNumber" placeholder="Invoice Number" required>
        <input name="date" type="date" required value="${new Date().toISOString().split('T')[0]}">
        <input name="description" placeholder="Description" required>
        <input name="amount" type="number" step="0.01" placeholder="Amount" required>
        <select name="type">
          <option value="consultation">Consultation</option><option value="medication">Medication</option><option value="procedure">Procedure</option><option value="room">Room Charges</option><option value="other">Other</option>
        </select>
        <select name="status">
          <option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option>
        </select>
        <input name="dueDate" type="date">
        <input name="paymentMethod" placeholder="Payment Method">
        <input name="insuranceClaim" placeholder="Insurance Claim Amount">
        <button class="primary">Create Bill</button>
      </form>
      <div id="billinglist" class="small"></div>
    </div>`;
  loadPatientOptions();
  document.getElementById("billingForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = {
      patientId: f.patientId.value,
      invoiceNumber: f.invoiceNumber.value,
      date: f.date.value,
      description: f.description.value,
      amount: parseFloat(f.amount.value),
      type: f.type.value,
      status: f.status.value,
      dueDate: f.dueDate.value,
      paymentMethod: f.paymentMethod.value,
      insuranceClaim: f.insuranceClaim.value
    };
    await fetch(`${API}/billing`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
    f.reset(); loadBillingList();
  });
  loadBillingList();
}

async function loadBillingList(){
  const res = await fetch(`${API}/billing`);
  const data = await res.json();
  document.getElementById("billinglist").innerHTML = data.map(b=>`<div class="list-item"><strong>${b.patient?.name || 'Unknown'}</strong> — $${b.amount} (${b.status})<div class="small">${b.description} | ${b.date}</div></div>`).join("");
}
// ---------- Reports ---------
function renderReports(){
  main.innerHTML = `
    <div class="card">
      <h2>Reports</h2>
      <div class="report-filters">
        <select id="reportType">
          <option value="patients">Patient Report</option>
          <option value="admissions">Admission Report</option>
          <option value="appointments">Appointment Report</option>
          <option value="billing">Billing Report</option>
          <option value="inventory">Inventory Report</option>
        </select>
        <input id="startDate" type="date" placeholder="Start Date">
        <input id="endDate" type="date" placeholder="End Date">
        <button id="generateReportBtn" class="primary">Generate Report</button>
      </div>
      <div id="reportContent"></div>
    </div>`;

  document.getElementById("generateReportBtn").addEventListener("click", generateReport);
}

async function generateReport(){
  const reportType = document.getElementById("reportType").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  let url = `${API}/${reportType}`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  let content = `<h3>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h3>`;
  if (reportType === 'patients') {
    content += `<p>Total Patients: ${data.length}</p>`;
    content += data.map(p => `<div class="list-item">${p.name} - ${p.email}</div>`).join('');
  } else if (reportType === 'admissions') {
    content += `<p>Total Admissions: ${data.length}</p>`;
    content += data.map(a => `<div class="list-item">${a.patient?.name} - ${a.ward} ${a.room}</div>`).join('');
  } else if (reportType === 'appointments') {
    content += `<p>Total Appointments: ${data.length}</p>`;
    content += data.map(a => `<div class="list-item">${a.patient?.name} - ${a.datetime}</div>`).join('');
  } else if (reportType === 'billing') {
    const total = data.reduce((sum, b) => sum + b.amount, 0);
    content += `<p>Total Revenue: $${total.toFixed(2)}</p>`;
    content += data.map(b => `<div class="list-item">${b.patient?.name} - $${b.amount}</div>`).join('');
  } else if (reportType === 'inventory') {
    content += `<p>Total Items: ${data.length}</p>`;
    content += data.map(i => `<div class="list-item">${i.name} - ${i.quantity} ${i.unit}</div>`).join('');
  }

  document.getElementById("reportContent").innerHTML = content;
}
// ---------- AI Health Reports ---------
function renderAIHealthReports(){
  main.innerHTML = `
    <div class="card">
      <h2>AI Health Reports</h2>
      <form id="aiReportForm" class="form-row">
        <select name="patientId" required><option value="">Select Patient</option></select>
        <textarea name="symptoms" placeholder="Describe symptoms or health concerns" rows="4" required></textarea>
        <button class="primary">Generate AI Report</button>
      </form>
      <div id="aiReportContent"></div>
    </div>`;
  loadPatientOptions();
  document.getElementById("aiReportForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = {
      patientId: f.patientId.value,
      symptoms: f.symptoms.value
    };

    document.getElementById("aiReportContent").innerHTML = "<p>Generating AI report...</p>";

    try {
      const response = await fetch(`${API}/ai-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      if (result.status === "ok") {
        document.getElementById("aiReportContent").innerHTML = `
          <div class="ai-report">
            <h3>AI Health Analysis</h3>
            <div class="report-section">
              <h4>Possible Conditions</h4>
              <p>${result.report.possibleConditions}</p>
            </div>
            <div class="report-section">
              <h4>Recommendations</h4>
              <p>${result.report.recommendations}</p>
            </div>
            <div class="report-section">
              <h4>Urgency Level</h4>
              <p>${result.report.urgency}</p>
            </div>
          </div>
        `;
      } else {
        document.getElementById("aiReportContent").innerHTML = `<p class="error">Error generating report: ${result.message}</p>`;
      }
    } catch (error) {
      document.getElementById("aiReportContent").innerHTML = `<p class="error">Failed to generate AI report. Please try again.</p>`;
    }
  });
}
