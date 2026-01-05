# backend/models.py
import sqlite3
from pathlib import Path
DB_PATH = Path(__file__).parent / "hms.db"
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
def init_db():
    conn = get_conn()
    cur = conn.cursor()
    # users (simple placeholder)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      password TEXT
    )""")
    # vitals (existing)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      value TEXT,
      unit TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )""")
    # symptoms
    cur.execute("""
    CREATE TABLE IF NOT EXISTS symptoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      system TEXT,
      severity INTEGER,
      notes TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )""")
    # medications
    cur.execute("""
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      dose TEXT,
      schedule TEXT,
      start_date TEXT,
      end_date TEXT,
      notes TEXT
    )""")
    # appointments
    cur.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      doctor TEXT,
      datetime TEXT,
      type TEXT,
      notes TEXT
    )""")
    # patients
    cur.execute("""
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT,
      blood_type TEXT,
      allergies TEXT,
      chronic_conditions TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      emergency_contact_relationship TEXT,
      insurance_provider TEXT,
      insurance_policy_number TEXT,
      insurance_coverage TEXT,
      medical_history TEXT,
      current_medications TEXT,
      preferred_doctor TEXT,
      registration_date TEXT DEFAULT CURRENT_TIMESTAMP
    )""")
    # admissions
    cur.execute("""
    CREATE TABLE IF NOT EXISTS admissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      ward TEXT,
      room TEXT,
      bed TEXT,
      floor TEXT,
      admission_type TEXT,
      diagnosis TEXT,
      chief_complaint TEXT,
      admission_date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id)
    )""")
    # inventory
    cur.execute("""
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      generic_name TEXT,
      category TEXT,
      subcategory TEXT,
      description TEXT,
      manufacturer TEXT,
      quantity INTEGER,
      unit TEXT,
      cost_price REAL,
      selling_price REAL,
      expiry_date TEXT,
      batch_number TEXT,
      supplier TEXT,
      location TEXT,
      reorder_level INTEGER,
      maximum_stock INTEGER
    )""")
    # billing
    cur.execute("""
    CREATE TABLE IF NOT EXISTS billing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      invoice_number TEXT,
      date TEXT,
      description TEXT,
      amount REAL,
      type TEXT,
      status TEXT,
      due_date TEXT,
      payment_method TEXT,
      insurance_claim REAL,
      FOREIGN KEY (patient_id) REFERENCES patients (id)
    )""")
    conn.commit()
    conn.close()
