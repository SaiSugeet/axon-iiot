import time
from flask import Flask, jsonify, request
from flask_cors import CORS
import database
import config
import mqtt_subscriber

app = Flask(__name__)
CORS(app, origins="*")

start_time = time.time()
current_scenario = "UNKNOWN"

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "online", "service": "AXON Central Server"})

@app.route("/api/iasi/latest", methods=["GET"])
def iasi_latest():
    data = database.get_latest_iasi()
    if data:
        return jsonify(data)
    return jsonify({"iasi_score": 0, "classification": "SAFE", "message": "No data yet"})

@app.route("/api/iasi/history", methods=["GET"])
def iasi_history():
    history = database.get_iasi_history(60)
    return jsonify(history)

@app.route("/api/fft/latest", methods=["GET"])
def fft_latest():
    fft = mqtt_subscriber.latest_fft
    if fft:
        return jsonify(fft)
    return jsonify({
        "dominant_freq": 0, "peak_power": 0, "rms_amplitude": 0,
        "spectral_centroid": 0, "energy_0_20hz": 0,
        "energy_20_80hz": 0, "energy_80_200hz": 0
    })

@app.route("/api/system/status", methods=["GET"])
def system_status():
    conn = __import__("sqlite3").connect(config.DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM iasi_readings")
        packet_count = cursor.fetchone()[0]
        cursor.execute("SELECT timestamp FROM heartbeat_log ORDER BY timestamp DESC LIMIT 1")
        row = cursor.fetchone()
        last_heartbeat = row[0] if row else None
    except Exception:
        packet_count = 0
        last_heartbeat = None
    finally:
        conn.close()
    return jsonify({
        "packet_count": packet_count,
        "last_heartbeat": last_heartbeat,
        "signal_continuity": database.get_heartbeat_rate(),
        "server_uptime": round(time.time() - start_time, 1)
    })

@app.route("/api/scenario/set", methods=["POST"])
def set_scenario():
    global current_scenario
    api_key = request.headers.get("X-API-Key", "")
    if api_key != config.API_KEY:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    if not data or "scenario" not in data:
        return jsonify({"error": "Missing scenario field"}), 400
    current_scenario = data["scenario"]
    return jsonify({"status": "ok", "scenario": current_scenario})
