import numpy as np
import os
import joblib
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from scipy import stats
import config
import fft_processor

LABEL_MAP = {0: "SAFE", 1: "MONITOR", 2: "ALERT", 3: "CRITICAL"}

def generate_normal_windows(n=500):
    features_list = []
    fs = config.SAMPLING_RATE
    t = np.linspace(0, 1, fs)
    for _ in range(n):
        freq = np.random.uniform(3, 6)
        amp = np.random.uniform(0.1, 0.3)
        noise = np.random.normal(0, 0.02, fs)
        samples = amp * np.sin(2 * np.pi * freq * t) + noise
        feats = fft_processor.extract_features(samples.tolist(), fs=fs)
        features_list.append(list(feats.values()))
    return np.array(features_list)

def generate_training_sequences():
    scenario_ranges = {
        0: (5, 18),
        1: (22, 38),
        1: (15, 30),
        2: (38, 54),
        3: (60, 92)
    }
    all_ranges = [
        (0, 5, 18),
        (1, 22, 38),
        (1, 15, 30),
        (2, 38, 54),
        (3, 60, 92)
    ]
    X, y = [], []
    per_class = 2000 // len(all_ranges)
    for label, lo, hi in all_ranges:
        for _ in range(per_class):
            seq = np.random.uniform(lo, hi, 10)
            slope, _, _, _, _ = stats.linregress(range(10), seq)
            variance = float(np.var(seq))
            features = list(seq) + [slope, variance]
            X.append(features)
            y.append(label)
    return np.array(X), np.array(y)

def load_or_train_models():
    iso_path = os.path.join(config.MODEL_DIR, "isolation_forest_v1.joblib")
    rf_path = os.path.join(config.MODEL_DIR, "random_forest_v1.joblib")

    os.makedirs(config.MODEL_DIR, exist_ok=True)

    if os.path.exists(iso_path) and os.path.exists(rf_path):
        print("Loading saved models...")
        iso_forest = joblib.load(iso_path)
        rf_classifier = joblib.load(rf_path)
        print("Models loaded successfully")
        return iso_forest, rf_classifier

    print("Training models — first run...")
    print("Training Isolation Forest on NORMAL vibration windows...")
    normal_features = generate_normal_windows(500)
    iso_forest = IsolationForest(contamination=0.05, n_estimators=100, random_state=42)
    iso_forest.fit(normal_features)
    joblib.dump(iso_forest, iso_path)
    print("Isolation Forest trained and saved")

    print("Training Random Forest classifier...")
    X, y = generate_training_sequences()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )
    rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_classifier.fit(X_train, y_train)
    y_pred = rf_classifier.predict(X_test)
    print("\n=== Random Forest Classification Report ===")
    print(classification_report(y_test, y_pred,
          target_names=["SAFE", "MONITOR", "ALERT", "CRITICAL"]))
    joblib.dump(rf_classifier, rf_path)
    print("Random Forest trained and saved")

    return iso_forest, rf_classifier

def compute_iasi(vibration_score, signal_continuity):
    base = (vibration_score * config.IASI_W1 * 100) + (signal_continuity * config.IASI_W2 * 100)
    if vibration_score >= config.IASI_CRITICAL_OVERRIDE_THRESHOLD:
        base = max(base, 80)
    elif vibration_score >= config.IASI_ALERT_OVERRIDE_THRESHOLD:
        base = max(base, 55)
    return round(min(max(base, 0), 100), 2)
