
// app.js - Enhanced SPA for Health Management System
const API = "http://127.0.0.1:5000/api";
let userId = null;
let currentUser = null;
const main = document.getElementById("main");
const sidebar = document.getElementById("sidebar");
const nav = document.getElementById("nav");
const mobileNavToggle = document.getElementById("mobileNavToggle");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");

let currentPage = "dashboard";
let chartInstance = null;

// Authentication
function initAuth() {
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginMessage = document.getElementById("loginMessage");

  // Check if already logged in
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    userId = currentUser.id;
    showMainApp();
    loadPage("dashboard");
  } else {
    showLoginScreen();
  }

  // Login form handler
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.status === "ok") {
        currentUser = data.user;
        userId = data.user.id;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        showMainApp();
        loadPage("dashboard");
      } else {
        loginMessage.innerHTML = showError(data.message || "Login failed");
      }
    } catch (error) {
      loginMessage.innerHTML = showError("Network error. Please try again.");
    }
  });

  // Logout handler
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    currentUser = null;
    userId = null;
    showLoginScreen();
  });
}

function showLoginScreen() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("mainApp").style.display = "none";
}

function showMainApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainApp").style.display = "flex";
}

// Navigation
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    loadPage(e.target.dataset.page);
  }
});

mobileNavToggle.addEventListener("click", () => {
  sidebar.classList.toggle("show");
  nav.classList.toggle("show");
});

// Modal functions
function showModal(title, message, onConfirm) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.style.display = "flex";

  const handleConfirm = () => {
    onConfirm();
    hideModal();
  };

  const handleCancel = () => hideModal();

  modalConfirm.onclick = handleConfirm;
  modalCancel.onclick = handleCancel;

  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) hideModal();
  };
}

function hideModal() {
  modal.style.display = "none";
}

// Utility functions
function showLoading(container) {
  container.innerHTML = '<div class="loading">Loading...</div>';
}

function showError(message) {
  return `<div class="error">${message}</div>`;
}

function showSuccess(message) {
  return `<div class="success">${message}</div>`;
}

function updateNavActive(page) {
  document.querySelectorAll(".nav button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
}

function loadPage(page) {
  currentPage = page;
  updateNavActive(page);
  if (window.innerWidth <= 768) {
    sidebar.classList.remove("show");
    nav.classList.remove("show");
  }

  if (page === "dashboard") return renderDashboard();
  if (page === "patients") return renderPatients();
  if (page === "checkups") return renderCheckups();
  if (page === "hospitality") return renderHospitality();
  if (page === "bills") return renderBills();
  if (page === "vitals") return renderVitals();
  if (page === "symptoms") return renderSymptoms();
  if (page === "meds") return renderMeds();
  if (page === "appts") return renderAppts();
  if (page === "reports") return renderReports();
}

loadPage("dashboard");
// ---------- Dashboard ---------
async function renderDashboard(){
  main.innerHTML = `
    <div class="card">
      <h2>Dashboard</h2>
      <div id="dash-summary"></div>
      <div class="chart-container">
        <canvas id="vitalsChart"></canvas>
      </div>
      <div id="dash-recent"></div>
    </div>`;

  const dashSummary = document.getElementById("dash-summary");
  const dashRecent = document.getElementById("dash-recent");

  try {
    // Fetch all data for summary
    const [vitalsRes, symptomsRes, medsRes, apptsRes] = await Promise.all([
      fetch(`${API}/vitals/${userId}`),
      fetch(`${API}/symptoms/${userId}`),
      fetch(`${API}/meds/${userId}`),
      fetch(`${API}/appointments/${userId}`)
    ]);

    const vitals = await vitalsRes.json();
    const symptoms = await symptomsRes.json();
    const meds = await medsRes.json();
    const appts = await apptsRes.json();

    // Summary
    dashSummary.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="text-align: center; padding: 16px; background: var(--bg); border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: var(--primary);">${vitals.length}</div>
          <div class="small">Vitals Recorded</div>
        </div>
        <div style="text-align: center; padding: 16px; background: var(--bg); border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: var(--secondary);">${symptoms.length}</div>
          <div class="small">Symptoms Logged</div>
        </div>
        <div style="text-align: center; padding: 16px; background: var(--bg); border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: var(--success);">${meds.length}</div>
          <div class="small">Medications</div>
        </div>
        <div style="text-align: center; padding: 16px; background: var(--bg); border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: var(--warning);">${appts.length}</div>
          <div class="small">Appointments</div>
        </div>
      </div>`;

    // Chart for vitals (simple line chart for BP if available)
    const ctx = document.getElementById('vitalsChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const bpData = vitals.filter(v => v.type.toLowerCase().includes('bp')).slice(-10);
    const labels = bpData.map(v => new Date(v.timestamp).toLocaleDateString());
    const values = bpData.map(v => parseFloat(v.value.split('/')[0])); // Systolic

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Blood Pressure (Systolic)',
          data: values,
          borderColor: 'var(--primary)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });

    // Recent activity
    const recentVitals = vitals.slice(0, 5);
    const recentSymptoms = symptoms.slice(0, 3);
    const recentAppts = appts.slice(0, 3);

    dashRecent.innerHTML = `
      <h3>Recent Activity</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        <div>
          <h4>Latest Vitals</h4>
          ${recentVitals.map(v => `<div class="small">${v.timestamp} — <strong>${v.type}</strong>: ${v.value} ${v.unit}</div>`).join('') || '<div class="small">No vitals recorded</div>'}
        </div>
        <div>
          <h4>Recent Symptoms</h4>
          ${recentSymptoms.map(s => `<div class="small">${s.timestamp} — ${s.name} (${s.severity}/10)</div>`).join('') || '<div class="small">No symptoms logged</div>'}
        </div>
        <div>
          <h4>Upcoming Appointments</h4>
          ${recentAppts.map(a => `<div class="small">${a.datetime} — Dr. ${a.doctor}</div>`).join('') || '<div class="small">No appointments scheduled</div>'}
        </div>
      </div>`;

  } catch (error) {
    dashSummary.innerHTML = showError("Failed to load dashboard data. Please check if the backend is running.");
    console.error("Dashboard error:", error);
  }
}
// ---------- Vitals ---------
function renderVitals(){
  main.innerHTML = `
    <div class="card">
      <h2>Vitals</h2>
      <form id="vitalForm">
        <div class="form-row">
          <div class="form-group">
            <label for="vitalType">Type</label>
            <select id="vitalType" name="type" required>
              <option value="">Select type</option>
              <option value="Blood Pressure">Blood Pressure</option>
              <option value="Heart Rate">Heart Rate</option>
              <option value="Temperature">Temperature</option>
              <option value="Weight">Weight</option>
              <option value="Height">Height</option>
              <option value="BMI">BMI</option>
            </select>
          </div>
          <div class="form-group">
            <label for="vitalValue">Value</label>
            <input id="vitalValue" name="value" placeholder="Enter value" required>
          </div>
          <div class="form-group">
            <label for="vitalUnit">Unit</label>
            <input id="vitalUnit" name="unit" placeholder="e.g., mmHg, bpm, °F">
          </div>
        </div>
        <button class="primary" type="submit">Add Vital</button>
      </form>
      <div id="vitalsMessage"></div>
      <div id="vlist"></div>
    </div>`;

  document.getElementById("vitalForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const messageEl = document.getElementById("vitalsMessage");

    const body = {
      user_id: userId,
      type: f.type.value,
      value: f.value.value,
      unit: f.unit.value
    };

    try {
      const res = await fetch(`${API}/vitals`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
      if (res.ok) {
        messageEl.innerHTML = showSuccess("Vital added successfully!");
        f.reset();
        await loadVitalsList();
      } else {
        messageEl.innerHTML = showError("Failed to add vital.");
      }
    } catch (error) {
      messageEl.innerHTML = showError("Network error. Please try again.");
    }
  });

  loadVitalsList();
}

async function loadVitalsList(){
  const container = document.getElementById("vlist");
  showLoading(container);

  try {
    const res = await fetch(`${API}/vitals/${userId}`);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = '<div class="small" style="text-align: center; padding: 24px;">No vitals recorded yet.</div>';
      return;
    }

    container.innerHTML = data.map(v => `
      <div class="list-item">
        <div class="content">
          <div><strong>${v.type}</strong> — ${v.value} ${v.unit || ''}</div>
          <div class="small">${new Date(v.timestamp).toLocaleString()}</div>
        </div>
        <div class="actions">
          <button class="btn-small btn-edit" onclick="editVital(${v.id}, '${v.type}', '${v.value}', '${v.unit}')">Edit</button>
          <button class="btn-small btn-delete" onclick="deleteVital(${v.id})">Delete</button>
        </div>
      </div>`).join("");
  } catch (error) {
    container.innerHTML = showError("Failed to load vitals.");
  }
}

function editVital(id, type, value, unit) {
  // For now, just alert - backend doesn't have edit endpoint
  alert("Edit functionality requires backend update. ID: " + id);
}

function deleteVital(id) {
  showModal("Delete Vital", "Are you sure you want to delete this vital record?", async () => {
    // Backend doesn't have delete endpoint, so just alert
    alert("Delete functionality requires backend update. ID: " + id);
  });
}
// ---------- Symptoms ---------
function renderSymptoms(){
  main.innerHTML = `
    <div class="card">
      <h2>Symptoms</h2>
      <form id="symForm" class="form-row">
        <input name="name" placeholder="Symptom name" required>
        <select name="system">
          <option>Cardiovascular</option>
          <option>Respiratory</option>
          <option>Digestive</option>
          <option>Nervous</option>
        </select>
        <input name="severity" type="number" min="1" max="10" placeholder="severity 1-10" required>
        <input name="notes" placeholder="notes">
        <button class="primary">Log Symptom</button>
      </form>
      <div id="slist" class="small"></div>
    </div>`;
  document.getElementById("symForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = { user_id:userId, name:f.name.value, system:f.system.value, severity:Number(f.severity.value), notes: f.notes.value };
    await fetch(`${API}/symptoms`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
    f.reset(); loadSymptomsList();
  });
  loadSymptomsList();
}
async function loadSymptomsList(){
  const res = await fetch(`${API}/symptoms/${userId}`);
  const data = await res.json();
  const container = document.getElementById("slist");
  container.innerHTML = data.map(s=>`<div class="list-item"><div><strong>${s.name}</strong> (${s.system}) severity:${s.severity}</div><div class="small">${s.timestamp}</div><div>${s.notes || ''}</div></div>`).join("");
}
// ---------- Medications ---------
function renderMeds(){
  main.innerHTML = `
    <div class="card">
      <h2>Medications</h2>
      <form id="medForm" class="form-row">
        <input name="name" placeholder="Medication name" required>
        <input name="dose" placeholder="Dose (e.g., 5mg)">
        <input name="schedule" placeholder="Schedule (e.g., once daily)">
        <input name="start_date" type="date">
        <button class="primary">Add Med</button>
      </form>
      <div id="medlist" class="small"></div>
    </div>`;
  document.getElementById("medForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = {
      user_id: userId,
      name: f.name.value,
      dose: f.dose.value,
      schedule: f.schedule.value,
      start_date: f.start_date.value
    };
    await fetch(`${API}/meds`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
    f.reset(); loadMedsList();
  });
  loadMedsList();
}
async function loadMedsList(){
  const res = await fetch(`${API}/meds/${userId}`);
  const data = await res.json();
  document.getElementById("medlist").innerHTML = data.map(m=>`<div class="list-item"><strong>${m.name}</strong> ${m.dose} — ${m.schedule}<div class="small">start: ${m.start_date || '—'}</div></div>`).join("");
}
// ---------- Appointments ---------
function renderAppts(){
  main.innerHTML = `
    <div class="card">
      <h2>Appointments</h2>
      <form id="apptForm" class="form-row">
        <input name="doctor" placeholder="Doctor name" required>
        <input name="datetime" type="datetime-local" required>
        <select name="type"><option>in-person</option><option>telehealth</option></select>
        <input name="notes" placeholder="notes">
        <button class="primary">Book</button>
      </form>
      <div id="applist" class="small"></div>
    </div>`;
  document.getElementById("apptForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const body = {
      user_id: userId,
      doctor: f.doctor.value,
      datetime: f.datetime.value,
      type: f.type.value,
      notes: f.notes.value
    };
    await fetch(`${API}/appointments`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
    f.reset(); loadApptsList();
  });
  loadApptsList();
}
async function loadApptsList(){
  const res = await fetch(`${API}/appointments/${userId}`);
  const data = await res.json();
  document.getElementById("applist").innerHTML = data.map(a=>`<div class="list-item"><strong>${a.doctor}</strong> — ${a.datetime} <div class="small">${a.type}</div></div>`).join("");
}
// ---------- Patients ---------
function renderPatients(){
  main.innerHTML = `
    <div class="card">
      <h2>Patients</h2>
      <form id="patientForm">
        <div class="form-row">
          <div class="form-group">
            <label for="patientName">Name</label>
            <input id="patientName" name="name" placeholder="Full name" required>
          </div>
          <div class="form-group">
            <label for="patientDob">Date of Birth</label>
            <input id="patientDob" name="dob" type="date" required>
          </div>
          <div class="form-group">
            <label for="patientGender">Gender</label>
            <select id="patientGender" name="gender" required>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="patientPhone">Phone</label>
            <input id="patientPhone" name="phone" placeholder="Phone number" required>
          </div>
          <div class="form-group">
            <label for="patientEmail">Email</label>
            <input id="patientEmail" name="email" type="email" placeholder="Email address" required>
          </div>
          <div class="form-group">
            <label for="patientBloodType">Blood Type</label>
            <select id="patientBloodType" name="blood_type">
              <option value="">Select blood type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="patientAddress">Address</label>
            <textarea id="patientAddress" name="address" placeholder="Full address"></textarea>
          </div>
          <div class="form-group">
            <label for="patientEmergencyContact">Emergency Contact</label>
            <input id="patientEmergencyContact" name="emergency_contact" placeholder="Emergency contact name">
          </div>
          <div class="form-group">
            <label for="patientEmergencyPhone">Emergency Phone</label>
            <input id="patientEmergencyPhone" name="emergency_phone" placeholder="Emergency phone">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="patientMedicalHistory">Medical History</label>
            <textarea id="patientMedicalHistory" name="medical_history" placeholder="Medical history"></textarea>
          </div>
          <div class="form-group">
            <label for="patientAllergies">Allergies</label>
            <textarea id="patientAllergies" name="allergies" placeholder="Known allergies"></textarea>
          </div>
        </div>
        <button class="primary" type="submit">Add Patient</button>
      </form>
      <div id="patientMessage"></div>
      <div id="patientList"></div>
    </div>`;

  document.getElementById("patientForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const messageEl = document.getElementById("patientMessage");

    const body = {
      name: f.name.value,
      dob: f.dob.value,
      gender: f.gender.value,
      phone: f.phone.value,
      email: f.email.value,
      blood_type: f.blood_type.value,
      address: f.address.value,
      emergency_contact: f.emergency_contact.value,
      emergency_phone: f.emergency_phone.value,
      medical_history: f.medical_history.value,
      allergies: f.allergies.value
    };

    try {
      const res = await fetch(`${API}/patients`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
      if (res.ok) {
        messageEl.innerHTML = showSuccess("Patient added successfully!");
        f.reset();
        await loadPatientsList();
      } else {
        messageEl.innerHTML = showError("Failed to add patient.");
      }
    } catch (error) {
      messageEl.innerHTML = showError("Network error. Please try again.");
    }
  });

  loadPatientsList();
}

async function loadPatientsList(){
  const container = document.getElementById("patientList");
  showLoading(container);

  try {
    const res = await fetch(`${API}/patients`);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = '<div class="small" style="text-align: center; padding: 24px;">No patients registered yet.</div>';
      return;
    }

    container.innerHTML = data.map(p => `
      <div class="list-item">
        <div class="content">
          <div><strong>${p.name}</strong> — ${p.email} | ${p.phone}</div>
          <div class="small">DOB: ${p.dob} | Gender: ${p.gender} | Blood Type: ${p.blood_type || 'N/A'}</div>
        </div>
        <div class="actions">
          <button class="btn-small btn-view" onclick="viewPatient(${p.id})">View Details</button>
          <button class="btn-small btn-edit" onclick="editPatient(${p.id})">Edit</button>
        </div>
      </div>`).join("");
  } catch (error) {
    container.innerHTML = showError("Failed to load patients.");
  }
}

function viewPatient(id) {
  // For now, just alert - can be expanded to show detailed view
  alert("View patient details functionality. ID: " + id);
}

function editPatient(id) {
  // For now, just alert - backend doesn't have edit endpoint
  alert("Edit functionality requires backend update. ID: " + id);
}

// ---------- Checkups ---------
function renderCheckups(){
  main.innerHTML = `
    <div class="card">
      <h2>Medical Checkups</h2>
      <form id="checkupForm">
        <div class="form-row">
          <div class="form-group">
            <label for="checkupPatientId">Patient ID</label>
            <input id="checkupPatientId" name="patient_id" type="number" placeholder="Patient ID" required>
          </div>
          <div class="form-group">
            <label for="checkupTestType">Test Type</label>
            <select id="checkupTestType" name="test_type" required>
              <option value="">Select test type</option>
              <option value="Blood Test">Blood Test</option>
              <option value="Urine Test">Urine Test</option>
              <option value="X-Ray">X-Ray</option>
              <option value="MRI">MRI</option>
              <option value="CT Scan">CT Scan</option>
              <option value="ECG">ECG</option>
              <option value="Ultrasound">Ultrasound</option>
            </select>
          </div>
          <div class="form-group">
            <label for="checkupTestName">Test Name</label>
            <input id="checkupTestName" name="test_name" placeholder="Specific test name" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="checkupValue">Value</label>
            <input id="checkupValue" name="value" placeholder="Test result value" required>
          </div>
          <div class="form-group">
            <label for="checkupUnit">Unit</label>
            <input id="checkupUnit" name="unit" placeholder="Unit (e.g., mg/dL, mmHg)" required>
          </div>
          <div class="form-group">
            <label for="checkupReferenceRange">Reference Range</label>
            <input id="checkupReferenceRange" name="reference_range" placeholder="Normal range">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="checkupResultStatus">Result Status</label>
            <select id="checkupResultStatus" name="result_status">
              <option value="Normal">Normal</option>
              <option value="Abnormal">Abnormal</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div class="form-group">
            <label for="checkupPerformedBy">Performed By</label>
            <input id="checkupPerformedBy" name="performed_by" placeholder="Doctor/Lab technician name">
          </div>
        </div>
        <button class="primary" type="submit">Add Checkup Result</button>
      </form>
      <div id="checkupMessage"></div>
      <div id="checkupList"></div>
    </div>`;

  document.getElementById("checkupForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const messageEl = document.getElementById("checkupMessage");

    const body = {
      patient_id: parseInt(f.patient_id.value),
      test_type: f.test_type.value,
      test_name: f.test_name.value,
      value: f.value.value,
      unit: f.unit.value,
      reference_range: f.reference_range.value,
      result_status: f.result_status.value,
      performed_by: f.performed_by.value
    };

    try {
      const res = await fetch(`${API}/checkups`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
      if (res.ok) {
        messageEl.innerHTML = showSuccess("Checkup result added successfully!");
        f.reset();
        await loadCheckupsList();
      } else {
        messageEl.innerHTML = showError("Failed to add checkup result.");
      }
    } catch (error) {
      messageEl.innerHTML = showError("Network error. Please try again.");
    }
  });

  loadCheckupsList();
}

async function loadCheckupsList(){
  const container = document.getElementById("checkupList");
  showLoading(container);

  try {
    // For demo, we'll load checkups for patient ID 1, but ideally this should be selectable
    const res = await fetch(`${API}/checkups/1`);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = '<div class="small" style="text-align: center; padding: 24px;">No checkup results recorded yet.</div>';
      return;
    }

    container.innerHTML = data.map(c => `
      <div class="list-item">
        <div class="content">
          <div><strong>${c.test_name}</strong> (${c.test_type}) — ${c.value} ${c.unit}</div>
          <div class="small">Date: ${c.timestamp} | Status: ${c.result_status} | Performed by: ${c.performed_by || 'N/A'}</div>
        </div>
        <div class="actions">
          <button class="btn-small btn-view" onclick="viewCheckup(${c.id})">View Details</button>
        </div>
      </div>`).join("");
  } catch (error) {
    container.innerHTML = showError("Failed to load checkup results.");
  }
}

function viewCheckup(id) {
  alert("View checkup details functionality. ID: " + id);
}

// ---------- Hospitality ---------
function renderHospitality(){
  main.innerHTML = `
    <div class="card">
      <h2>Hospital Stay Information</h2>
      <form id="hospitalityForm">
        <div class="form-row">
          <div class="form-group">
            <label for="hospPatientId">Patient ID</label>
            <input id="hospPatientId" name="patient_id" type="number" placeholder="Patient ID" required>
          </div>
          <div class="form-group">
            <label for="hospAdmissionDate">Admission Date</label>
            <input id="hospAdmissionDate" name="admission_date" type="date" required>
          </div>
          <div class="form-group">
            <label for="hospDischargeDate">Discharge Date</label>
            <input id="hospDischargeDate" name="discharge_date" type="date">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="hospRoomNumber">Room Number</label>
            <input id="hospRoomNumber" name="room_number" placeholder="Room number" required>
          </div>
          <div class="form-group">
            <label for="hospRoomType">Room Type</label>
            <select id="hospRoomType" name="room_type" required>
              <option value="">Select room type</option>
              <option value="General">General</option>
              <option value="Private">Private</option>
              <option value="Semi-Private">Semi-Private</option>
              <option value="ICU">ICU</option>
              <option value="CCU">CCU</option>
            </select>
          </div>
          <div class="form-group">
            <label for="hospDailyRate">Daily Rate ($)</label>
            <input id="hospDailyRate" name="daily_rate" type="number" step="0.01" placeholder="Daily rate" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="hospServices">Services</label>
            <textarea id="hospServices" name="services" placeholder="Services provided during stay"></textarea>
          </div>
          <div class="form-group">
            <label for="hospStatus">Status</label>
            <select id="hospStatus" name="status">
              <option value="Active">Active</option>
              <option value="Discharged">Discharged</option>
              <option value="Transferred">Transferred</option>
            </select>
          </div>
        </div>
        <button class="primary" type="submit">Add Hospital Stay</button>
      </form>
      <div id="hospitalityMessage"></div>
      <div id="hospitalityList"></div>
    </div>`;

  document.getElementById("hospitalityForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const messageEl = document.getElementById("hospitalityMessage");

    const body = {
      patient_id: parseInt(f.patient_id.value),
      admission_date: f.admission_date.value,
      discharge_date: f.discharge_date.value || null,
      room_number: f.room_number.value,
      room_type: f.room_type.value,
      daily_rate: parseFloat(f.daily_rate.value),
      services: f.services.value,
      status: f.status.value
    };

    try {
      const res = await fetch(`${API}/hospitality`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
      if (res.ok) {
        messageEl.innerHTML = showSuccess("Hospital stay added successfully!");
        f.reset();
        await loadHospitalityList();
      } else {
        messageEl.innerHTML = showError("Failed to add hospital stay.");
      }
    } catch (error) {
      messageEl.innerHTML = showError("Network error. Please try again.");
    }
  });

  loadHospitalityList();
}

async function loadHospitalityList(){
  const container = document.getElementById("hospitalityList");
  showLoading(container);

  try {
    // For demo, we'll load hospitality for patient ID 1
    const res = await fetch(`${API}/hospitality/1`);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = '<div class="small" style="text-align: center; padding: 24px;">No hospital stays recorded yet.</div>';
      return;
    }

    container.innerHTML = data.map(h => `
      <div class="list-item">
        <div class="content">
          <div><strong>Room ${h.room_number}</strong> (${h.room_type}) — $${h.daily_rate}/day</div>
          <div class="small">Admission: ${h.admission_date} | Discharge: ${h.discharge_date || 'Ongoing'} | Status: ${h.status}</div>
        </div>
        <div class="actions">
          <button class="btn-small btn-view" onclick="viewHospitality(${h.id})">View Details</button>
        </div>
      </div>`).join("");
  } catch (error) {
    container.innerHTML = showError("Failed to load hospital stays.");
  }
}

function viewHospitality(id) {
  alert("View hospitality details functionality. ID: " + id);
}

// ---------- Bills ---------
function renderBills(){
  main.innerHTML = `
    <div class="card">
      <h2>Billing</h2>
      <form id="billForm">
        <div class="form-row">
          <div class="form-group">
            <label for="billPatientId">Patient ID</label>
            <input id="billPatientId" name="patient_id" type="number" placeholder="Patient ID" required>
          </div>
          <div class="form-group">
            <label for="billDate">Bill Date</label>
            <input id="billDate" name="bill_date" type="date" required>
          </div>
          <div class="form-group">
            <label for="billPaymentStatus">Payment Status</label>
            <select id="billPaymentStatus" name="payment_status">
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="billSubtotal">Subtotal ($)</label>
            <input id="billSubtotal" name="subtotal" type="number" step="0.01" placeholder="Subtotal amount" required>
          </div>
          <div class="form-group">
            <label for="billTaxRate">Tax Rate (%)</label>
            <input id="billTaxRate" name="tax_rate" type="number" step="0.01" placeholder="Tax rate (e.g., 0.08 for 8%)" value="0.08">
          </div>
          <div class="form-group">
            <label for="billTaxAmount">Tax Amount ($)</label>
            <input id="billTaxAmount" name="tax_amount" type="number" step="0.01" placeholder="Tax amount">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="billTotalAmount">Total Amount ($)</label>
            <input id="billTotalAmount" name="total_amount" type="number" step="0.01" placeholder="Total amount" required>
          </div>
          <div class="form-group">
            <label for="billItemizedCharges">Itemized Charges (JSON)</label>
            <textarea id="billItemizedCharges" name="itemized_charges" placeholder='[{"description": "Consultation", "quantity": 1, "unit_price": 150.00, "total": 150.00}]' rows="3"></textarea>
          </div>
        </div>
        <button class="primary" type="submit">Create Bill</button>
      </form>
      <div id="billMessage"></div>
      <div id="billList"></div>
    </div>`;

  document.getElementById("billForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target;
    const messageEl = document.getElementById("billMessage");

    const body = {
      patient_id: parseInt(f.patient_id.value),
      bill_date: f.bill_date.value,
      payment_status: f.payment_status.value,
      subtotal: parseFloat(f.subtotal.value),
      tax_rate: parseFloat(f.tax_rate.value),
      tax_amount: parseFloat(f.tax_amount.value) || 0,
      total_amount: parseFloat(f.total_amount.value),
      itemized_charges: f.itemized_charges.value || '[]'
    };

    try {
      const res = await fetch(`${API}/bills`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
      if (res.ok) {
        messageEl.innerHTML = showSuccess("Bill created successfully!");
        f.reset();
        await loadBillsList();
      } else {
        messageEl.innerHTML = showError("Failed to create bill.");
      }
    } catch (error) {
      messageEl.innerHTML = showError("Network error. Please try again.");
    }
  });

  loadBillsList();
}

async function loadBillsList(){
  const container = document.getElementById("billList");
  showLoading(container);

  try {
    // For demo, we'll load bills for patient ID 1
    const res = await fetch(`${API}/bills/1`);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = '<div class="small" style="text-align: center; padding: 24px;">No bills recorded yet.</div>';
      return;
    }

    container.innerHTML = data.map(b => `
      <div class="list-item">
        <div class="content">
          <div><strong>Bill Date:</strong> ${b.bill_date} | <strong>Total:</strong> $${b.total_amount.toFixed(2)}</div>
          <div class="small">Status: ${b.payment_status} | Subtotal: $${b.subtotal.toFixed(2)} | Tax: $${b.tax_amount.toFixed(2)}</div>
        </div>
        <div class="actions">
          <button class="btn-small btn-view" onclick="viewBill(${b.id})">View Details</button>
          <button class="btn-small btn-notify" onclick="sendBillNotification(1)">Send Notification</button>
        </div>
      </div>`).join("");
  } catch (error) {
    container.innerHTML = showError("Failed to load bills.");
  }
}

function viewBill(id) {
  alert("View bill details functionality. ID: " + id);
}

async function sendBillNotification(patientId) {
  try {
    const res = await fetch(`${API}/send-bill-notification/${patientId}`, {method: 'POST'});
    const result = await res.json();
    if (result.status === 'success') {
      alert("Bill notification sent successfully!");
    } else {
      alert("Failed to send bill notification: " + result.message);
    }
  } catch (error) {
    alert("Error sending bill notification: " + error.message);
  }
}

// ---------- Reports ---------
function renderReports(){
  main.innerHTML = `
    <div class="card">
      <h2>Reports</h2>
      <div class="form-row">
        <div class="form-group">
          <label for="reportPatientId">Patient ID</label>
          <input id="reportPatientId" name="patient_id" type="number" placeholder="Patient ID" value="1">
        </div>
      </div>
      <div style="display: flex; gap: 16px; margin-bottom: 24px;">
        <button id="genHealthReport" class="primary">Generate Health Report</button>
        <button id="genPatientReport" class="primary">Generate Patient Bill Report</button>
        <button id="sendPatientReport" class="secondary">Send Patient Report Email</button>
      </div>
      <div id="reportMessage"></div>
    </div>`;

  document.getElementById("genHealthReport").addEventListener("click", async ()=>{
    const patientId = document.getElementById("reportPatientId").value || 1;
    const url = `${API}/report/${patientId}`;
    const res = await fetch(url);
    if (!res.ok) return alert('Failed to generate health report');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `health-report-patient${patientId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    document.getElementById("reportMessage").innerText = "Health report downloaded.";
  });

  document.getElementById("genPatientReport").addEventListener("click", async ()=>{
    const patientId = document.getElementById("reportPatientId").value || 1;
    const url = `${API}/patient-report/${patientId}`;
    const res = await fetch(url);
    if (!res.ok) return alert('Failed to generate patient bill report');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `patient-bill-report-${patientId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    document.getElementById("reportMessage").innerText = "Patient bill report downloaded.";
  });

  document.getElementById("sendPatientReport").addEventListener("click", async ()=>{
    const patientId = document.getElementById("reportPatientId").value || 1;
    try {
      const res = await fetch(`${API}/send-patient-report/${patientId}`, {method: 'POST'});
      const result = await res.json();
      if (result.status === 'success') {
        document.getElementById("reportMessage").innerText = "Patient report email sent successfully!";
      } else {
        document.getElementById("reportMessage").innerText = "Failed to send patient report email: " + result.message;
      }
    } catch (error) {
      document.getElementById("reportMessage").innerText = "Error sending patient report email: " + error.message;
    }
  });
}

// Initialize the app
initAuth()