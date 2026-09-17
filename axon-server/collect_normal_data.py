import paho.mqtt.client as mqtt
import json
import numpy as np
import joblib
import os
import sys

sys.path.insert(0, '.')
import fft_processor
import config

collected = []
TARGET = 500

def on_connect(client, userdata, flags, rc):
    client.subscribe("railway/vibration")
    print(f"Collecting {TARGET} NORMAL windows from Pi...")

def on_message(client, userdata, msg):
    global collected
    payload = json.loads(msg.payload.decode())
    scenario = payload.get("scenario", "")
    if scenario != "NORMAL":
        print(f"Skipping {scenario} — switch Pi to NORMAL")
        return
    samples = payload.get("samples", [])
    if len(samples) < 100:
        return
    feats = fft_processor.extract_features(samples)
    collected.append(list(feats.values()))
    count = len(collected)
    if count % 50 == 0:
        print(f"  Collected {count}/{TARGET} windows...")
    if count >= TARGET:
        print(f"\nRetraining Isolation Forest on {TARGET} real NORMAL windows...")
        X = np.array(collected)
        from sklearn.ensemble import IsolationForest
        iso = IsolationForest(contamination=0.05, n_estimators=100, random_state=42)
        iso.fit(X)
        os.makedirs(config.MODEL_DIR, exist_ok=True)
        joblib.dump(iso, os.path.join(config.MODEL_DIR, 'isolation_forest_v1.joblib'))
        scores = iso.decision_function(X)
        print(f"Retrained! Score mean: {np.mean(scores):.4f}, std: {np.std(scores):.4f}")
        print("Isolation Forest saved. Restart main.py now.")
        client.disconnect()

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect("localhost", 1883, 60)
client.loop_forever()
