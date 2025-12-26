30# backend/app.py
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from models import get_conn, init_db
from report_utils import generate_health_report
import sqlite3, io, os
import hashlib
init_db()
app = Flask(__name__)
CORS(app)
# ------------------------
# Login
# ------------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email=? AND password=?", (email, hashed_password))
    row = cur.fetchone()
    conn.close()

    if row:
        user = dict(row)
        return jsonify({"status": "ok", "user": user})
    else:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401
# ------------------------
# Vitals
# ------------------------
@app.route("/api/vitals", methods=["POST"])
def add_vital():
    data = request.json
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO vitals (user_id, type, value, unit) VALUES (?, ?, ?, ?)",
                (data.get("user_id",1), data["type"], str(data["value"]), data.get("unit","")))
    conn.commit()
    conn.close()
    return jsonify({"status":"ok"}), 201
@app.route("/api/vitals/<int:user_id>", methods=["GET"])
def get_vitals(user_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM vitals WHERE user_id=? ORDER BY timestamp DESC", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)
# ------------------------
# Symptoms
# ------------------------
@app.route("/api/symptoms", methods=["POST"])
def add_symptom():
    data = request.json
    conn = get_conn(); cur = conn.cursor()
    cur.execute("INSERT INTO symptoms (user_id, name, system, severity, notes) VALUES (?, ?, ?, ?, ?)",
                (data.get('user_id',1), data['name'], data.get('system','General'), int(data.get('severity',1)), data.get('notes','')))
    conn.commit(); conn.close()
    return jsonify({"status":"ok"}), 201
@app.route("/api/symptoms/<int:user_id>", methods=["GET"])
def get_symptoms(user_id):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT * FROM symptoms WHERE user_id=? ORDER BY timestamp DESC", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]; conn.close()
    return jsonify(rows)
# ------------------------
# Medications
# ------------------------
@app.route("/api/meds", methods=["POST"])
def add_med():
    data = request.json
    conn = get_conn(); cur = conn.cursor()
    cur.execute("INSERT INTO medications (user_id, name, dose, schedule, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (data.get('user_id',1), data['name'], data.get('dose',''), data.get('schedule',''), data.get('start_date',''), data.get('end_date',''), data.get('notes','')))
    conn.commit(); conn.close()
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
    cur.execute("INSERT INTO appointments (user_id, doctor, datetime, type, notes) VALUES (?, ?, ?, ?, ?)",
                (data.get('user_id',1), data.get('doctor',''), data.get('datetime',''), data.get('type','in-person'), data.get('notes','')))
    conn.commit(); conn.close()
    return jsonify({"status":"ok"}), 201
@app.route("/api/appointments/<int:user_id>", methods=["GET"])
def get_appts(user_id):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT * FROM appointments WHERE user_id=? ORDER BY datetime DESC", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]; conn.close()
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
if __name__ == "__main__":
    # ensure a default user exists with password
    conn = get_conn(); cur = conn.cursor()
    hashed_password = hashlib.sha256("password".encode()).hexdigest()
    cur.execute("INSERT OR IGNORE INTO users (id, name, email, password) VALUES (1, 'Mohit Prad', 'mohit@example.com', ?)", (hashed_password,))
    conn.commit(); conn.close()
    app.run(debug=True, port=5000)
