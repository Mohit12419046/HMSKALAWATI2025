// app.js - minimal SPA
const API = "http://127.0.0.1:5000/api";
let userId = null;
let user = null;
let currentPatientId = null;
let liveMonitoringInterval = null;
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
  setupLandingPageListeners();
});

function checkLoginStatus() {
  const storedUser = localStorage.getItem('hms_user');
  if (storedUser) {
    user = JSON.parse(storedUser);
    userId = user.id;
    loadPage("dashboard");
  } else {
    // Redirect to login page
    window.location.href = 'login.html';
  }
}

function setupLandingPageListeners() {
  // Login button on landing page
  const loginBtn = document.getElementById('landingLoginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      showLoginModal();
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
}

function showLandingPage() {
  main.innerHTML = `
    <div class="landing-page">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Health Management System</h1>
          <p class="hero-subtitle">Comprehensive healthcare management solution for modern hospitals</p>
          <div class="hero-features">
            <div class="feature-item">
              <i class="fas fa-users"></i>
              <span>Patient Management</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-calendar-check"></i>
              <span>Appointment Scheduling</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-chart-line"></i>
              <span>Analytics & Reports</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-robot"></i>
              <span>AI Health Insights</span>
            </div>
          </div>
          <button id="landingLoginBtn" class="cta-button">Get Started</button>
        </div>
        <div class="hero-image">
          <i class="fas fa-hospital"></i>
        </div>
      </div>

      <div class="features-section">
        <h2>Why Choose Our HMS?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h3>Secure & Compliant</h3>
            <p>HIPAA compliant with enterprise-grade security</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-clock"></i>
            </div>
            <h3>Real-time Updates</h3>
            <p>Live monitoring and instant notifications</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <h3>Mobile Friendly</h3>
            <p>Access anywhere, anytime on any device</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-brain"></i>
            </div>
            <h3>AI-Powered</h3>
            <p>Intelligent insights for better patient care</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <div id="loginModal" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <div class="login-form">
          <h2>Welcome Back</h2>
          <form id="modalLoginForm">
            <div class="form-group">
              <label for="modalEmail">Email:</label>
              <input type="email" id="modalEmail" name="email" required>
            </div>
            <div class="form-group">
              <label for="modalPassword">Password:</label>
              <input type="password" id="modalPassword" name="password" required>
            </div>
            <button type="submit" class="primary">Login</button>
          </form>
          <div id="modalLoginMessage"></div>
        </div>
      </div>
    </div>
  `;

  // Setup modal close button
  const closeBtn = document.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('loginModal').style.display = 'none';
    });
  }

  // Setup modal login form
  const modalLoginForm = document.getElementById('modalLoginForm');
  if (modalLoginForm) {
    modalLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
      };

      try {
        const response = await fetch(`${API}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        });

        const result = await response.json();
        if (result.status === 'ok') {
          user = result.user;
          userId = user.id;
          localStorage.setItem('hms_user', JSON.stringify(user));
          document.getElementById('loginModal').style.display = 'none';
          loadPage('dashboard');
        } else {
          document.getElementById('modalLoginMessage').innerHTML = `<p class="error">${result.message}</p>`;
        }
      } catch (error) {
        document.getElementById('modalLoginMessage').innerHTML = `<p class="error">Login failed. Please try again.</p>`;
      }
    });
  }
}

function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'block';
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

function startLiveMonitoring() {
  if (liveMonitoringInterval) {
    clearInterval(liveMonitoringInterval);
  }
  liveMonitoringInterval = setInterval(() => {
    loadEmergencyAlerts();
  }, 5000); // Update every 5 seconds
}

function stopLiveMonitoring() {
  if (liveMonitoringInterval) {
    clearInterval(liveMonitoringInterval);
    liveMonitoringInterval = null;
  }
}

function loadPage(page){
  // Stop live monitoring when navigating away from dashboard
  if (page !== "dashboard") {
    stopLiveMonitoring();
  }

  if(page === "landing") return showLandingPage();
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
  if(page === "graphs") return renderGraphs();
}

// Always start with dashboard - login button will show login form when clicked
if (typeof jest === 'undefined') loadPage("dashboard");
// ---------- Dashboard ---------
function showAdmissionModal() {
  document.getElementById("admissionModal").style.display = "block";
}
function showAppointmentModal() {
  document.getElementById("appointmentModal").style.display = "block";
}
function showInventoryModal() {
  document.getElementById("inventoryModal").style.display = "block";
}
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
          <button class="action-btn primary" onclick="showPatientDetailsModal()">
            <i class="fas fa-user-plus"></i>
            <span>Add Patient</span>
          </button>
          <button class="action-btn secondary" onclick="showAdmissionModal()">
            <i class="fas fa-hospital"></i>
            <span>New Admission</span>
          </button>
          <button class="action-btn success" onclick="showAppointmentModal()">
            <i class="fas fa-calendar-plus"></i>
            <span>Book Appointment</span>
          </button>
          <button class="action-btn warning" onclick="showInventoryModal()">
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

      <!-- Live Vitals Monitoring -->
      <div class="live-vitals">
        <h2>Live Vitals Monitoring</h2>
        <div class="vitals-grid">
          <div class="vital-card">
            <div class="vital-icon">
              <i class="fas fa-heartbeat"></i>
            </div>
            <div class="vital-content">
              <h3>Blood Pressure</h3>
              <div id="liveBP" class="vital-value">--</div>
            </div>
          </div>
          <div class="vital-card">
            <div class="vital-icon">
              <i class="fas fa-tint"></i>
            </div>
            <div class="vital-content">
              <h3>Blood Glucose (Sugar)</h3>
              <div id="liveGlucose" class="vital-value">--</div>
            </div>
          </div>
          <div class="vital-card">
            <div class="vital-icon">
              <i class="fas fa-thermometer-half"></i>
            </div>
            <div class="vital-content">
              <h3>Body Temperature</h3>
              <div id="liveTemp" class="vital-value">--</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Admission Modal -->
    <div id="admissionModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="document.getElementById('admissionModal').style.display='none'">&times;</span>
        <h2>New Patient Admission</h2>
        <form id="admissionModalForm" class="form-row">
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
          <button type="submit" class="primary">Admit Patient</button>
        </form>
      </div>
    </div>

    <!-- Appointment Modal -->
    <div id="appointmentModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="document.getElementById('appointmentModal').style.display='none'">&times;</span>
        <h2>Book Appointment</h2>
        <form id="appointmentModalForm" class="form-row">
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
          <button type="submit" class="primary">Book Appointment</button>
        </form>
      </div>
    </div>

    <!-- Inventory Modal -->
    <div id="inventoryModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="document.getElementById('inventoryModal').style.display='none'">&times;</span>
        <h2>Update Inventory</h2>
        <form id="inventoryModalForm" class="form-row">
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
          <button type="submit" class="primary">Add Item</button>
        </form>
      </div>
    </div>

    <!-- Patient Details Modal -->
    <div id="patientModal" class="modal">
      <div class="modal-content">
        <span class="close" id="closePatientModal">&times;</span>
        <h2 id="modalTitle">Patient Details</h2>
        <form id="patientForm" class="form-row">
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
          <div class="family-members-section">
            <h4>Family Members Accompanying Patient</h4>
            <div class="family-members-list" id="familyMembersList">
              <!-- Family members will be added here -->
            </div>
            <button type="button" id="addFamilyMemberBtn" class="secondary">Add Family Member</button>
          </div>
          <button type="submit" class="primary" id="submitPatientBtn">Save Patient</button>
        </form>
      </div>
    </div>`;

  // Load dashboard stats
  loadDashboardStats();
  // Load emergency alerts
  loadEmergencyAlerts();
  // Start live monitoring for emergency alerts
  startLiveMonitoring();

  // Setup modal event listeners
  setupDashboardModals();
}

function setupDashboardModals() {
  // Admission Modal Form
  const admissionModalForm = document.getElementById('admissionModalForm');
  if (admissionModalForm) {
    admissionModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      const patientData = {
        name: f.name.value,
        email: f.email.value,
        phone: f.phone.value,
        dateOfBirth: f.dateOfBirth.value,
        gender: f.gender.value,
        bloodType: f.bloodType.value,
        allergies: f.allergies.value ? f.allergies.value.split('\n').filter(a => a.trim()).map(a => a.trim()) : [],
        chronicConditions: f.chronicConditions.value ? f.chronicConditions.value.split('\n').filter(c => c.trim()).map(c => c.trim()) : [],
        emergencyContact: {
          name: f.emergencyContactName.value,
          phone: f.emergencyContactPhone.value,
          relationship: f.emergencyContactRelationship.value
        },
        insurance: {
          provider: f.insuranceProvider.value,
          policyNumber: f.insurancePolicyNumber.value,
          coverage: f.insuranceCoverage.value
        },
        medicalHistory: f.medicalHistory.value ? f.medicalHistory.value.split('\n').filter(h => h.trim()).map(h => h.trim()) : [],
        currentMedications: f.currentMedications.value ? f.currentMedications.value.split('\n').filter(m => m.trim()).map(m => m.trim()) : [],
        preferredDoctor: f.preferredDoctor.value,
        registrationDate: f.registrationDate.value,
        accompanyingFamily: []
      };
      const patientRes = await fetch(`${API}/patients`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patientData) });
      const patient = await patientRes.json();
      const admissionData = {
        patientId: patient.id,
        ward: f.ward.value,
        room: f.room.value,
        bed: f.bed.value,
        floor: f.floor.value,
        admissionType: f.admissionType.value,
        diagnosis: f.diagnosis.value,
        chiefComplaint: f.chiefComplaint.value
      };
      await fetch(`${API}/admissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(admissionData) });
      f.reset();
      document.getElementById('admissionModal').style.display = 'none';
      if (typeof loadAdmissionList === 'function') loadAdmissionList();
      if (typeof loadPatientList === 'function') loadPatientList();
    });
  }

  // Appointment Modal Form
  const appointmentModalForm = document.getElementById('appointmentModalForm');
  if (appointmentModalForm) {
    // Load patient options
    loadPatientOptionsForAppointmentModal();
    appointmentModalForm.addEventListener('submit', async (e) => {
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
      await fetch(`${API}/appointments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      f.reset();
      document.getElementById('appointmentModal').style.display = 'none';
      if (typeof loadApptsList === 'function') loadApptsList();
    });
  }

  // Inventory Modal Form
  const inventoryModalForm = document.getElementById('inventoryModalForm');
  if (inventoryModalForm) {
    inventoryModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      const body = {
        name: f.name.value,
        genericName: f.genericName.value,
        category: f.category.value,
        subcategory: f.subcategory.value,
        description: f.description.value,
        manufacturer: f.manufacturer.value,
        quantity: Number(f.quantity.value),
        unit: f.unit.value,
        costPrice: parseFloat(f.costPrice.value),
        sellingPrice: f.sellingPrice.value ? parseFloat(f.sellingPrice.value) : null,
        expiryDate: f.expiryDate.value,
        batchNumber: f.batchNumber.value,
        supplier: f.supplier.value,
        location: f.location.value,
        reorderLevel: f.reorderLevel.value ? Number(f.reorderLevel.value) : null,
        maximumStock: f.maximumStock.value ? Number(f.maximumStock.value) : null
      };
      await fetch(`${API}/inventory`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      f.reset();
      document.getElementById('inventoryModal').style.display = 'none';
      if (typeof loadInventoryList === 'function') loadInventoryList();
    });
  }
}

async function loadPatientOptionsForAppointmentModal() {
  const res = await fetch(`${API}/patients`);
  const patients = await res.json();
  const select = document.querySelector('#appointmentModal select[name="patientId"]');
  if (select) {
    select.innerHTML = '<option value="">Select Patient</option>' + patients.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  }
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

    // Update live vitals display
    const latestBP = vitals.filter(v => v.type === 'Blood Pressure').sort((a,b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0];
    const latestGlucose = vitals.filter(v => v.type === 'Blood Glucose').sort((a,b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0];
    const latestTemp = vitals.filter(v => v.type === 'Temperature').sort((a,b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0];

    const liveBP = document.getElementById('liveBP');
    const liveGlucose = document.getElementById('liveGlucose');
    const liveTemp = document.getElementById('liveTemp');

    if (liveBP) liveBP.textContent = latestBP ? latestBP.value : '--';
    if (liveGlucose) liveGlucose.textContent = latestGlucose ? latestGlucose.value : '--';
    if (liveTemp) liveTemp.textContent = latestTemp ? latestTemp.value : '--';

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
      } else if (vital.type === 'Blood Glucose') {
        const glucose = parseFloat(vital.value);
        if (glucose > 200) {
          alerts.push({
            patient: vital.patient?.name || 'Unknown',
            type: 'High Blood Sugar',
            value: vital.value + ' ' + vital.unit,
            time: vital.recordedAt
          });
        } else if (glucose < 70) {
          alerts.push({
            patient: vital.patient?.name || 'Unknown',
            type: 'Low Blood Sugar',
            value: vital.value + ' ' + vital.unit,
            time: vital.recordedAt
          });
        }
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
      <h2>Patient Management</h2>
      <button id="addPatientBtn" class="primary">Add Patient</button>
      <div id="patientlist" class="small"></div>

      <!-- Patient Details Modal -->
      <div id="patientModal" class="modal">
        <div class="modal-content">
          <span class="close" id="closePatientModal">&times;</span>
          <h2 id="modalTitle">Patient Details</h2>
          <form id="patientForm" class="form-row">
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
            <div class="family-members-section">
              <h4>Family Members Accompanying Patient</h4>
              <div class="family-members-list" id="familyMembersList">
                <!-- Family members will be added here -->
              </div>
              <button type="button" id="addFamilyMemberBtn" class="secondary">Add Family Member</button>
            </div>
            <button type="submit" class="primary" id="submitPatientBtn">Save Patient</button>
          </form>
        </div>
      </div>
    </div>`;

  document.getElementById("addPatientBtn").addEventListener("click", () => showPatientDetailsModal());
  document.getElementById("closePatientModal").addEventListener("click", () => document.getElementById("patientModal").style.display = "none");
  document.getElementById("addFamilyMemberBtn").addEventListener("click", addFamilyMember);
  document.getElementById("patientForm").addEventListener("submit", submitPatientForm);

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
  document.getElementById("patientlist").innerHTML = data.map(p=>`<div class="list-item"><strong>${p.name}</strong> — ${p.email || 'No email'}<div class="small">${p.phone || 'No phone'}</div><button class="secondary small-btn" onclick="showPatientDetailsModal(${p.id})">More</button></div>`).join("");
}

async function showPatientDetailsModal(id = null) {
  currentPatientId = id;
  const modal = document.getElementById("patientModal");
  const form = document.getElementById("patientForm");
  const title = document.getElementById("modalTitle");
  const submitBtn = document.getElementById("submitPatientBtn");

  if (id) {
    // Edit mode
    title.textContent = "Edit Patient Details";
    submitBtn.textContent = "Update Patient";

    // Fetch patient data
    try {
      const res = await fetch(`${API}/patients/${id}`);
      const patient = await res.json();

      // Populate form
      form.name.value = patient.name || '';
      form.email.value = patient.email || '';
      form.phone.value = patient.phone || '';
      form.dateOfBirth.value = patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '';
      form.gender.value = patient.gender || '';
      form.bloodType.value = patient.bloodType || '';
      form.allergies.value = patient.allergies ? patient.allergies.join('\n') : '';
      form.chronicConditions.value = patient.chronicConditions ? patient.chronicConditions.join('\n') : '';
      form.emergencyContactName.value = patient.emergencyContact?.name || '';
      form.emergencyContactPhone.value = patient.emergencyContact?.phone || '';
      form.emergencyContactRelationship.value = patient.emergencyContact?.relationship || '';
      form.insuranceProvider.value = patient.insurance?.provider || '';
      form.insurancePolicyNumber.value = patient.insurance?.policyNumber || '';
      form.insuranceCoverage.value = patient.insurance?.coverage || '';
      form.medicalHistory.value = patient.medicalHistory ? patient.medicalHistory.join('\n') : '';
      form.currentMedications.value = patient.currentMedications ? patient.currentMedications.join('\n') : '';
      form.preferredDoctor.value = patient.preferredDoctor || '';
      form.registrationDate.value = patient.registrationDate ? patient.registrationDate.split('T')[0] : new Date().toISOString().split('T')[0];

      // Populate family members
      const familyList = document.getElementById("familyMembersList");
      familyList.innerHTML = '';
      if (patient.accompanyingFamily && patient.accompanyingFamily.length > 0) {
        patient.accompanyingFamily.forEach(member => {
          const memberDiv = document.createElement("div");
          memberDiv.className = "family-member-item";
          memberDiv.innerHTML = `
            <input name="familyName" placeholder="Family Member Name" value="${member.name || ''}" required>
            <input name="familyRelation" placeholder="Relationship to Patient" value="${member.relationship || ''}" required>
            <input name="familyPhone" placeholder="Phone Number" value="${member.phone || ''}">
            <button type="button" class="remove-family-member-btn danger">Remove</button>
          `;
          memberDiv.querySelector('.remove-family-member-btn').addEventListener('click', () => memberDiv.remove());
          familyList.appendChild(memberDiv);
        });
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      alert('Error loading patient details');
      return;
    }
  } else {
    // Add mode
    title.textContent = "Add Patient Details";
    submitBtn.textContent = "Save Patient";
    form.reset();
    document.getElementById("familyMembersList").innerHTML = '';
    form.registrationDate.value = new Date().toISOString().split('T')[0];
  }

  modal.style.display = "block";
}

function addFamilyMember() {
  const familyList = document.getElementById("familyMembersList");
  const memberDiv = document.createElement("div");
  memberDiv.className = "family-member-item";
  memberDiv.innerHTML = `
    <input name="familyName" placeholder="Family Member Name" required>
    <input name="familyRelation" placeholder="Relationship to Patient" required>
    <input name="familyPhone" placeholder="Phone Number">
    <button type="button" class="remove-family-member-btn danger">Remove</button>
  `;
  memberDiv.querySelector('.remove-family-member-btn').addEventListener('click', () => memberDiv.remove());
  familyList.appendChild(memberDiv);
}

async function submitPatientForm(e) {
  e.preventDefault();
  const form = e.target;

  // Collect family members
  const familyMembers = [];
  const familyItems = document.querySelectorAll('.family-member-item');
  familyItems.forEach(item => {
    const name = item.querySelector('input[name="familyName"]').value.trim();
    const relation = item.querySelector('input[name="familyRelation"]').value.trim();
    const phone = item.querySelector('input[name="familyPhone"]').value.trim();
    if (name && relation) {
      familyMembers.push({ name, relationship: relation, phone });
    }
  });

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

  try {
    let res;
    if (currentPatientId) {
      // Update
      res = await fetch(`${API}/patients/${currentPatientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
    } else {
      // Create
      res = await fetch(`${API}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
    }

    if (res.ok) {
      document.getElementById("patientModal").style.display = "none";
      loadPatientList();
      if (typeof loadAdmissionList === 'function') loadAdmissionList();
    } else {
      alert('Error saving patient');
    }
  } catch (error) {
    console.error('Error saving patient:', error);
    alert('Error saving patient');
  }
}
// ---------- Admissions ---------
function renderAdmissions(){
  main.innerHTML = `
    <div class="card">
      <h2>Patient Admission</h2>
      <form id="admissionForm" class="form-row">
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
  document.getElementById("admissionForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const patientData = {
      name: f.name.value,
      email: f.email.value,
      phone: f.phone.value,
      dateOfBirth: f.dateOfBirth.value,
      gender: f.gender.value,
      bloodType: f.bloodType.value,
      allergies: f.allergies.value ? f.allergies.value.split('\n').filter(a => a.trim()).map(a => a.trim()) : [],
      chronicConditions: f.chronicConditions.value ? f.chronicConditions.value.split('\n').filter(c => c.trim()).map(c => c.trim()) : [],
      emergencyContact: {
        name: f.emergencyContactName.value,
        phone: f.emergencyContactPhone.value,
        relationship: f.emergencyContactRelationship.value
      },
      insurance: {
        provider: f.insuranceProvider.value,
        policyNumber: f.insurancePolicyNumber.value,
        coverage: f.insuranceCoverage.value
      },
      medicalHistory: f.medicalHistory.value ? f.medicalHistory.value.split('\n').filter(h => h.trim()).map(h => h.trim()) : [],
      currentMedications: f.currentMedications.value ? f.currentMedications.value.split('\n').filter(m => m.trim()).map(m => m.trim()) : [],
      preferredDoctor: f.preferredDoctor.value,
      registrationDate: f.registrationDate.value,
      accompanyingFamily: []
    };
    const patientRes = await fetch(`${API}/patients`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patientData) });
    const patient = await patientRes.json();
    const admissionData = {
      patientId: patient.id,
      ward: f.ward.value,
      room: f.room.value,
      bed: f.bed.value,
      floor: f.floor.value,
      admissionType: f.admissionType.value,
      diagnosis: f.diagnosis.value,
      chiefComplaint: f.chiefComplaint.value
    };
    await fetch(`${API}/admissions`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(admissionData)});
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
// ---------- Graphs & Analytics ---------
function renderGraphs(){
  main.innerHTML = `
    <div class="card">
      <h2>Graphs & Analytics</h2>
      <div class="graph-filters">
        <select id="graphType">
          <option value="patients">Patient Trends</option>
          <option value="vitals">Vital Signs</option>
          <option value="symptoms">Symptoms Analysis</option>
          <option value="billing">Revenue Trends</option>
          <option value="admissions">Admission Trends</option>
        </select>
        <select id="patientSelect">
          <option value="">All Patients</option>
        </select>
        <input id="graphStartDate" type="date" placeholder="Start Date">
        <input id="graphEndDate" type="date" placeholder="End Date">
        <button id="generateGraphBtn" class="primary">Generate Graph</button>
      </div>
      <div class="graph-container">
        <canvas id="analyticsChart"></canvas>
      </div>
      <div id="graphStats"></div>
    </div>`;

  loadPatientOptionsForGraphs();
  document.getElementById("generateGraphBtn").addEventListener("click", generateGraph);

  // Load default graph
  setTimeout(() => generateGraph(), 500);
}

async function loadPatientOptionsForGraphs(){
  const res = await fetch(`${API}/patients`);
  const patients = await res.json();
  const select = document.getElementById('patientSelect');
  select.innerHTML = '<option value="">All Patients</option>' + patients.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}

async function generateGraph(){
  const graphType = document.getElementById("graphType").value;
  const patientId = document.getElementById("patientSelect").value;
  const startDate = document.getElementById("graphStartDate").value;
  const endDate = document.getElementById("graphEndDate").value;

  const canvas = document.getElementById('analyticsChart');
  const ctx = canvas.getContext('2d');

  // Destroy existing chart if it exists
  if (window.currentChart) {
    window.currentChart.destroy();
  }

  let data = [];
  let labels = [];
  let title = '';

  try {
    if (graphType === 'patients') {
      const res = await fetch(`${API}/patients`);
      const patients = await res.json();

      // Group by registration month
      const monthlyData = {};
      patients.forEach(p => {
        const date = new Date(p.registrationDate || p.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      });

      labels = Object.keys(monthlyData).sort();
      data = labels.map(month => monthlyData[month]);
      title = 'Patient Registration Trends';

    } else if (graphType === 'vitals') {
      let url = `${API}/vitals`;
      if (patientId) url += `?patientId=${patientId}`;

      const res = await fetch(url);
      const vitals = await res.json();

      // Group by type and date
      const vitalData = {};
      vitals.forEach(v => {
        if (!vitalData[v.type]) vitalData[v.type] = {};
        const date = new Date(v.recordedAt).toLocaleDateString();
        vitalData[v.type][date] = parseFloat(v.value);
      });

      const types = Object.keys(vitalData);
      if (types.length > 0) {
        labels = Object.keys(vitalData[types[0]]).sort();
        data = types.map(type => labels.map(date => vitalData[type][date] || 0));
        title = 'Vital Signs Trends';
      }

    } else if (graphType === 'symptoms') {
      let url = `${API}/symptoms`;
      if (patientId) url += `?patientId=${patientId}`;

      const res = await fetch(url);
      const symptoms = await res.json();

      // Group by severity over time
      const severityData = {};
      symptoms.forEach(s => {
        const date = new Date(s.reportedAt).toLocaleDateString();
        if (!severityData[date]) severityData[date] = [];
        severityData[date].push(s.severity);
      });

      labels = Object.keys(severityData).sort();
      data = labels.map(date => {
        const severities = severityData[date];
        return severities.reduce((sum, s) => sum + s, 0) / severities.length;
      });
      title = 'Average Symptom Severity Trends';

    } else if (graphType === 'billing') {
      const res = await fetch(`${API}/billing`);
      const bills = await res.json();

      // Group by month
      const monthlyRevenue = {};
      bills.forEach(b => {
        const date = new Date(b.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + b.amount;
      });

      labels = Object.keys(monthlyRevenue).sort();
      data = labels.map(month => monthlyRevenue[month]);
      title = 'Monthly Revenue Trends';

    } else if (graphType === 'admissions') {
      const res = await fetch(`${API}/admissions`);
      const admissions = await res.json();

      // Group by month
      const monthlyAdmissions = {};
      admissions.forEach(a => {
        const date = new Date(a.admissionDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyAdmissions[monthKey] = (monthlyAdmissions[monthKey] || 0) + 1;
      });

      labels = Object.keys(monthlyAdmissions).sort();
      data = labels.map(month => monthlyAdmissions[month]);
      title = 'Monthly Admission Trends';
    }

    // Create chart
    window.currentChart = new Chart(ctx, {
      type: graphType === 'vitals' ? 'line' : 'bar',
      data: {
        labels: labels,
        datasets: graphType === 'vitals' ? [
          {
            label: 'Blood Pressure',
            data: data[0] || [],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
          },
          {
            label: 'Heart Rate',
            data: data[1] || [],
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
          },
          {
            label: 'Temperature',
            data: data[2] || [],
            borderColor: 'rgb(255, 205, 86)',
            backgroundColor: 'rgba(255, 205, 86, 0.2)',
          }
        ] : [{
          label: title,
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title
          },
          legend: {
            display: graphType === 'vitals'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // Display stats
    const statsDiv = document.getElementById('graphStats');
    if (data.length > 0) {
      const total = data.reduce((sum, val) => sum + (Array.isArray(val) ? val.reduce((s, v) => s + v, 0) : val), 0);
      const average = total / data.length;
      const max = Math.max(...data.flat());

      statsDiv.innerHTML = `
        <div class="stats-summary">
          <div class="stat-item">
            <h4>Total</h4>
            <p>${total.toFixed(2)}</p>
          </div>
          <div class="stat-item">
            <h4>Average</h4>
            <p>${average.toFixed(2)}</p>
          </div>
          <div class="stat-item">
            <h4>Peak</h4>
            <p>${max.toFixed(2)}</p>
          </div>
        </div>
      `;
    } else {
      statsDiv.innerHTML = '<p>No data available for the selected criteria.</p>';
    }

  } catch (error) {
    console.error('Error generating graph:', error);
    document.getElementById('graphStats').innerHTML = '<p class="error">Error loading graph data. Please try again.</p>';
  }
}
