# backend/app.py
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from models import get_conn, init_db
from report_utils import generate_health_report
import sqlite3, io, os, hashlib, json, datetime
init_db()
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# KALAWATI RECORD File Management
KALAWATI_RECORD_FILE = "KALAWATI RECORD.json"

def load_kalawati_records():
    """Load existing KALAWATI records from file"""
    if os.path.exists(KALAWATI_RECORD_FILE):
        try:
            with open(KALAWATI_RECORD_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_kalawati_records(records):
    """Save KALAWATI records to file"""
    print(f"DEBUG: Saving KALAWATI records to {KALAWATI_RECORD_FILE}")
    print(f"DEBUG: Records keys: {list(records.keys())}")
    try:
        with open(KALAWATI_RECORD_FILE, 'w') as f:
            json.dump(records, f, indent=2, default=str)
        print(f"DEBUG: Successfully saved KALAWATI records")
    except Exception as e:
        print(f"DEBUG: Error saving KALAWATI records: {e}")

def update_patient_record(patient_id):
    """Update or create comprehensive patient record in KALAWATI RECORD.json"""
    print(f"DEBUG: update_patient_record called for patient_id: {patient_id}")
    conn = get_conn()
    cur = conn.cursor()

    # Get patient basic info
    cur.execute("SELECT * FROM patients WHERE id=?", (patient_id,))
    patient_row = cur.fetchone()
    if not patient_row:
        print(f"DEBUG: No patient found with id {patient_id}")
        conn.close()
        return

    patient = dict(patient_row)
    print(f"DEBUG: Found patient: {patient.get('name', 'Unknown')}")

    # Get all related data
    cur.execute("SELECT * FROM vitals WHERE user_id=? ORDER BY timestamp DESC", (patient_id,))
    vitals = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM symptoms WHERE user_id=? ORDER BY timestamp DESC", (patient_id,))
    symptoms = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM medications WHERE user_id=? ORDER BY id DESC", (patient_id,))
    medications = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM appointments WHERE user_id=? ORDER BY datetime DESC", (patient_id,))
    appointments = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM admissions WHERE patient_id=? ORDER BY id DESC", (patient_id,))
    admissions = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM billing WHERE patient_id=? ORDER BY id DESC", (patient_id,))
    billing = [dict(r) for r in cur.fetchall()]

    conn.close()

    # Load existing records
    records = load_kalawati_records()

    # Create comprehensive patient record
    patient_record = {
        "patient_id": patient_id,
        "basic_info": patient,
        "medical_history": {
            "vitals": vitals,
            "symptoms": symptoms,
            "medications": medications,
            "appointments": appointments,
            "admissions": admissions,
            "billing": billing
        },
        "last_updated": datetime.datetime.now().isoformat(),
        "record_version": "1.0"
    }

    # Save to records
    records[str(patient_id)] = patient_record
    save_kalawati_records(records)
# ------------------------
# Vitals
# ------------------------
@app.route("/api/vitals", methods=["POST"])
def add_vital():
    data = request.json
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO vitals (user_id, type, value, unit, recordedAt) VALUES (?, ?, ?, ?, ?)",
                (data.get("patientId",1), data["type"], str(data["value"]), data.get("unit",""), data.get("recordedAt")))
    conn.commit()
    conn.close()

    # Update KALAWATI RECORD
    update_patient_record(data.get("patientId",1))

    return jsonify({"status":"ok"}), 201
@app.route("/api/vitals/<int:user_id>", methods=["GET"])
def get_vitals(user_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM vitals WHERE user_id=? ORDER BY timestamp DESC", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/vitals", methods=["GET"])
def get_all_vitals():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT v.*, p.name as patient_name, p.email as patient_email FROM vitals v LEFT JOIN patients p ON v.user_id = p.id ORDER BY v.timestamp DESC")
    rows = [dict(r) for r in cur.fetchall()]
    # Convert to expected format
    for row in rows:
        row["patient"] = {"name": row.pop("patient_name"), "email": row.pop("patient_email")}
    conn.close()
    return jsonify(rows)
# ------------------------
# Symptoms
# ------------------------
@app.route("/api/symptoms", methods=["POST"])
def add_symptom():
    data = request.json
    conn = get_conn(); cur = conn.cursor()
    cur.execute("INSERT INTO symptoms (user_id, name, severity, onset, frequency, location, category, reportedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (data.get('patientId',1), data['name'], int(data.get('severity',1)), data.get('onset','sudden'), data.get('frequency','constant'), data.get('location',''), data.get('category','general'), data.get('reportedAt')))
    conn.commit(); conn.close()

    # Update KALAWATI RECORD
    update_patient_record(data.get('patientId',1))

    return jsonify({"status":"ok"}), 201
@app.route("/api/symptoms/<int:user_id>", methods=["GET"])
def get_symptoms(user_id):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT * FROM symptoms WHERE user_id=? ORDER BY timestamp DESC", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]; conn.close()
    return jsonify(rows)

@app.route("/api/symptoms", methods=["GET"])
def get_all_symptoms():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT s.*, p.name as patient_name, p.email as patient_email FROM symptoms s LEFT JOIN patients p ON s.user_id = p.id ORDER BY s.timestamp DESC")
    rows = [dict(r) for r in cur.fetchall()]
    # Convert to expected format
    for row in rows:
        row["patient"] = {"name": row.pop("patient_name"), "email": row.pop("patient_email")}
    conn.close()
    return jsonify(rows)
# ------------------------
# Medications
# ------------------------
@app.route("/api/meds", methods=["POST"])
def add_med():
    data = request.json
    conn = get_conn(); cur = conn.cursor()
    cur.execute("INSERT INTO medications (user_id, name, dose, schedule, start_date, end_date, notes, prescribedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (data.get('patientId',1), data['name'], data.get('dose',''), data.get('schedule',''), data.get('start_date',''), data.get('end_date',''), data.get('notes',''), data.get('prescribedAt')))
    conn.commit(); conn.close()

    # Update KALAWATI RECORD
    update_patient_record(data.get('patientId',1))

    return jsonify({"status":"ok"}), 201
@app.route("/api/meds/<int:user_id>", methods=["GET"])
def get_meds(user_id):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT * FROM medications WHERE user_id=? ORDER BY id DESC", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]; conn.close()
    return jsonify(rows)
# ------------------------
# Appointments
# ------------------------
@app.route("/api/appointments", methods=["POST"])
def add_appt():
    data = request.json
    conn = get_conn(); cur = conn.cursor()
    cur.execute("INSERT INTO appointments (user_id, doctor, datetime, type, notes, scheduledAt) VALUES (?, ?, ?, ?, ?, ?)",
                (data.get('patientId',1), data.get('doctor',''), data.get('datetime',''), data.get('type','in-person'), data.get('notes',''), data.get('scheduledAt')))
    conn.commit(); conn.close()

    # Update KALAWATI RECORD
    update_patient_record(data.get('patientId',1))

    return jsonify({"status":"ok"}), 201
@app.route("/api/appointments/<int:user_id>", methods=["GET"])
def get_appts(user_id):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT * FROM appointments WHERE user_id=? ORDER BY datetime DESC", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]; conn.close()
    return jsonify(rows)

@app.route("/api/appointments", methods=["GET"])
def get_all_appts():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT a.*, p.name as patient_name, p.email as patient_email FROM appointments a LEFT JOIN patients p ON a.user_id = p.id ORDER BY a.datetime DESC")
    rows = [dict(r) for r in cur.fetchall()]
    # Convert to expected format
    for row in rows:
        row["patient"] = {"name": row.pop("patient_name"), "email": row.pop("patient_email")}
    conn.close()
    return jsonify(rows)
# ------------------------
# Reports
# ------------------------
@app.route("/api/report/<int:user_id>", methods=["GET"])
def get_report(user_id):
    # gather user + records
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id=?", (user_id,))
    row = cur.fetchone()
    user = dict(row) if row is not None else {"name":"User"}
    # fetch rows separately
    cur.execute("SELECT * FROM vitals WHERE user_id=? ORDER BY timestamp DESC LIMIT 100", (user_id,))
    vitals = [dict(r) for r in cur.fetchall()]
    cur.execute("SELECT * FROM symptoms WHERE user_id=? ORDER BY timestamp DESC LIMIT 100", (user_id,))
    symptoms = [dict(r) for r in cur.fetchall()]
    cur.execute("SELECT * FROM medications WHERE user_id=? ORDER BY id DESC", (user_id,))
    meds = [dict(r) for r in cur.fetchall()]
    cur.execute("SELECT * FROM appointments WHERE user_id=? ORDER BY datetime DESC", (user_id,))
    appts = [dict(r) for r in cur.fetchall()]
    conn.close()
    pdf_bytes = generate_health_report(user, vitals, symptoms, meds, appts)
    return send_file(io.BytesIO(pdf_bytes), mimetype="application/pdf", as_attachment=True, download_name=f"hms-report-user{user_id}.pdf")
# ------------------------
# Login
# ------------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Accept any email/password combination - always return success
    user = {
        "id": 1,
        "name": "Admin User",
        "email": email or "admin@example.com"
    }
    return jsonify({"status": "ok", "user": user})

# ------------------------
# Patients
# ------------------------
@app.route("/api/patients", methods=["POST"])
def add_patient():
    data = request.json
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO patients (name, email, phone, date_of_birth, gender, blood_type, allergies, chronic_conditions,
                             emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                             insurance_provider, insurance_policy_number, insurance_coverage, medical_history,
                             current_medications, preferred_doctor, registration_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["name"], data.get("email"), data.get("phone"), data.get("dateOfBirth"), data.get("gender"),
        data.get("bloodType"), json.dumps(data.get("allergies", [])), json.dumps(data.get("chronicConditions", [])),
        data.get("emergencyContact", {}).get("name"), data.get("emergencyContact", {}).get("phone"),
        data.get("emergencyContact", {}).get("relationship"), data.get("insurance", {}).get("provider"),
        data.get("insurance", {}).get("policyNumber"), data.get("insurance", {}).get("coverage"),
        json.dumps(data.get("medicalHistory", [])), json.dumps(data.get("currentMedications", [])),
        data.get("preferredDoctor"), data.get("registrationDate")
    ))
    patient_id = cur.lastrowid
    conn.commit()
    conn.close()

    # Update KALAWATI RECORD
    update_patient_record(patient_id)

    return jsonify({"id": patient_id, "status": "ok"}), 201

@app.route("/api/patients", methods=["GET"])
def get_patients():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM patients ORDER BY id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)

# ------------------------
# Admissions
# ------------------------
@app.route("/api/admissions", methods=["POST"])
def add_admission():
    data = request.json
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO admissions (patient_id, ward, room, bed, floor, admission_type, diagnosis, chief_complaint, admission_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["patientId"], data["ward"], data["room"], data.get("bed"), data.get("floor"),
        data.get("admissionType"), data["diagnosis"], data.get("chiefComplaint"), data.get("admissionDate")
    ))
    admission_id = cur.lastrowid
    conn.commit()
    conn.close()

    # Update KALAWATI RECORD
    update_patient_record(data["patientId"])

    return jsonify({"id": admission_id, "status": "ok"}), 201

@app.route("/api/admissions", methods=["GET"])
def get_admissions():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT a.*, p.name as patient_name, p.email as patient_email
        FROM admissions a
        LEFT JOIN patients p ON a.patient_id = p.id
        ORDER BY a.id DESC
    """)
    rows = [dict(r) for r in cur.fetchall()]
    # Convert to expected format
    for row in rows:
        row["patient"] = {"name": row.pop("patient_name"), "email": row.pop("patient_email")}
    conn.close()
    return jsonify(rows)

# ------------------------
# Inventory
# ------------------------
@app.route("/api/inventory", methods=["POST"])
def add_inventory():
    data = request.json
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO inventory (name, generic_name, category, subcategory, description, manufacturer, quantity, unit,
                              cost_price, selling_price, expiry_date, batch_number, supplier, location, reorder_level, maximum_stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["name"], data.get("genericName"), data["category"], data.get("subcategory"), data.get("description"),
        data.get("manufacturer"), data["quantity"], data.get("unit"), data["costPrice"], data.get("sellingPrice"),
        data.get("expiryDate"), data.get("batchNumber"), data.get("supplier"), data.get("location"),
        data.get("reorderLevel"), data.get("maximumStock")
    ))
    inventory_id = cur.lastrowid
    conn.commit()
    conn.close()
    return jsonify({"id": inventory_id, "status": "ok"}), 201

@app.route("/api/inventory", methods=["GET"])
def get_inventory():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM inventory ORDER BY id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)

# ------------------------
# Billing
# ------------------------
@app.route("/api/billing", methods=["POST"])
def add_billing():
    data = request.json
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO billing (patient_id, invoice_number, date, description, amount, type, status, due_date, payment_method, insurance_claim)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["patientId"], data["invoiceNumber"], data["date"], data["description"], data["amount"],
        data.get("type"), data.get("status"), data.get("dueDate"), data.get("paymentMethod"), data.get("insuranceClaim")
    ))
    billing_id = cur.lastrowid
    conn.commit()
    conn.close()

    # Update KALAWATI RECORD
    update_patient_record(data["patientId"])

    return jsonify({"id": billing_id, "status": "ok"}), 201

@app.route("/api/billing", methods=["GET"])
def get_billing():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT b.*, p.name as patient_name, p.email as patient_email
        FROM billing b
        LEFT JOIN patients p ON b.patient_id = p.id
        ORDER BY b.id DESC
    """)
    rows = [dict(r) for r in cur.fetchall()]
    # Convert to expected format
    for row in rows:
        row["patient"] = {"name": row.pop("patient_name"), "email": row.pop("patient_email")}
    conn.close()
    return jsonify(rows)

# ------------------------
# AI Reports
# ------------------------
@app.route("/api/ai-reports", methods=["POST"])
def generate_ai_report():
    data = request.json
    patient_id = data.get("patientId")
    symptoms = data.get("symptoms", "")

    # Simple AI simulation - in a real app, this would call an AI service
    possible_conditions = ["Common Cold", "Flu", "Allergies"]
    recommendations = ["Rest and hydration", "Over-the-counter medications", "Consult a doctor if symptoms worsen"]
    urgency = "Low" if len(symptoms.split()) < 10 else "Medium"

    report = {
        "possibleConditions": ", ".join(possible_conditions),
        "recommendations": "; ".join(recommendations),
        "urgency": urgency
    }

    return jsonify({"status": "ok", "report": report})

if __name__ == "__main__":
    # ensure a default user exists with password
    conn = get_conn(); cur = conn.cursor()
    hashed_password = hashlib.sha256("password".encode()).hexdigest()
    cur.execute("INSERT OR IGNORE INTO users (id, name, email, password) VALUES (1, 'Mohit Prad', 'admin@example.com', ?)", (hashed_password,))
    conn.commit(); conn.close()
    app.run(debug=True, port=5000)
