import paho.mqtt.client as mqtt
import json
import threading
import time
import database
import fft_processor
import ml_models
import config

iso_forest = None
rf_classifier = None
iasi_window = []
scenario_label = "UNKNOWN"
latest_fft = None

def normalize_anomaly_score(raw_score):
    # IsolationForest decision_function:
    # Positive = normal, negative = anomalous
    # Typical normal range: +0.05 to +0.15
    # Typical anomaly range: -0.1 to -0.3
    # Map so that +0.1 (normal) -> ~0.05, -0.2 (anomalous) -> ~0.90
    normalized = 1.0 / (1.0 + pow(2.718281828, 15.0 * raw_score))
    return round(min(max(normalized, 0.0), 1.0), 4)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("MQTT connected to broker")
        for topic in config.MQTT_TOPICS:
            client.subscribe(topic)
            print(f"Subscribed to: {topic}")
    else:
        print(f"MQTT connection failed with code {rc}")

def on_message(client, userdata, msg):
    global iasi_window, scenario_label, latest_fft

    topic = msg.topic
    try:
        payload = json.loads(msg.payload.decode())
    except Exception as e:
        print(f"JSON parse error on {topic}: {e}")
        return

    if topic == "railway/vibration":
        samples = payload.get("samples", [])
        scenario = payload.get("scenario", "UNKNOWN")
        scenario_label = scenario

        if len(samples) < 10:
            return

        fft_feats = fft_processor.extract_features(samples)
        latest_fft = fft_feats
        feature_vector = list(fft_feats.values())

        raw_score = iso_forest.decision_function([feature_vector])[0]
        vibration_score = normalize_anomaly_score(raw_score)

        signal_continuity = database.get_heartbeat_rate()
        iasi = ml_models.compute_iasi(vibration_score, signal_continuity)

        iasi_window.append(iasi)
        if len(iasi_window) > 10:
            iasi_window.pop(0)

        if len(iasi_window) >= 10:
            from scipy import stats as sp_stats
            seq = iasi_window[-10:]
            slope, _, _, _, _ = sp_stats.linregress(range(10), seq)
            variance = float(__import__('numpy').var(seq))
            features_12 = seq + [slope, variance]
            pred = rf_classifier.predict([features_12])[0]
            classification = ml_models.LABEL_MAP.get(pred, "SAFE")
        else:
            classification = "SAFE"

        ts = time.strftime("%H:%M:%S")
        print(f"[{ts}] {scenario:<16} | IASI: {iasi:5.1f} | CLASS: {classification:<8} | VIB: {vibration_score:.3f} | COMM: {signal_continuity:.3f}")

        database.write_iasi(scenario, vibration_score, signal_continuity, iasi, classification, fft_feats["dominant_freq"])

    elif topic == "railway/system/heartbeat":
        device_id = payload.get("device_id", "unknown")
        database.write_heartbeat(device_id)
        ts = time.strftime("%H:%M:%S")
        print(f"[{ts}] HEARTBEAT from {device_id}")

    elif topic == "railway/obstacle":
        obs_class = payload.get("class", "unknown")
        confidence = payload.get("confidence", 0.0)
        ts = time.strftime("%H:%M:%S")
        print(f"[{ts}] OBSTACLE: {obs_class} ({confidence:.2f})")

def start_subscriber(iso, rf):
    global iso_forest, rf_classifier
    iso_forest = iso
    rf_classifier = rf

    client = mqtt.Client(client_id="axon-server-subscriber")
    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect(config.MQTT_BROKER, config.MQTT_PORT, 60)
    except Exception as e:
        print(f"MQTT connection error: {e}")
        print("Is Mosquitto running? Try: sudo systemctl start mosquitto")
        return

    thread = threading.Thread(target=client.loop_forever, daemon=True)
    thread.start()
    print("MQTT subscriber started in background thread")
