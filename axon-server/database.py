import sqlite3
import time
import config

def init_db():
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS iasi_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp REAL,
            scenario TEXT,
            vibration_score REAL,
            signal_continuity REAL,
            iasi_score REAL,
            classification TEXT,
            dominant_freq REAL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS heartbeat_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp REAL,
            device_id TEXT
        )
    ''')
    conn.commit()
    conn.close()
    print("Database initialized")

def write_iasi(scenario, vibration_score, signal_continuity, iasi_score, classification, dominant_freq):
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO iasi_readings
        (timestamp, scenario, vibration_score, signal_continuity, iasi_score, classification, dominant_freq)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (time.time(), scenario, vibration_score, signal_continuity, iasi_score, classification, dominant_freq))
    conn.commit()
    conn.close()

def write_heartbeat(device_id):
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO heartbeat_log (timestamp, device_id) VALUES (?, ?)',
                   (time.time(), device_id))
    conn.commit()
    conn.close()

def get_latest_iasi():
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM iasi_readings ORDER BY timestamp DESC LIMIT 1')
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_iasi_history(limit=60):
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM iasi_readings ORDER BY timestamp DESC LIMIT ?', (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in reversed(rows)]

def get_heartbeat_rate(window_seconds=60):
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    cutoff = time.time() - window_seconds
    cursor.execute('SELECT COUNT(*) FROM heartbeat_log WHERE timestamp > ?', (cutoff,))
    count = cursor.fetchone()[0]
    conn.close()
    expected = window_seconds / 30.0
    return min(count / expected, 1.0)
