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
      email TEXT
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
    conn.commit()
    conn.close()
