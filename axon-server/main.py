import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import database
import ml_models
import mqtt_subscriber
import flask_api

def main():
    print("""
╔══════════════════════════════════════╗
║   AXON Central Server v2.0          ║
║   Adaptive eXtended-bridge          ║
║   Operational Network               ║
╚══════════════════════════════════════╝
    """)

    database.init_db()

    iso_forest, rf_classifier = ml_models.load_or_train_models()

    mqtt_subscriber.start_subscriber(iso_forest, rf_classifier)
    print("MQTT subscriber started")

    print("Flask API starting on port 5000...")
    print("Test with: curl http://localhost:5000/health")
    flask_api.app.run(host="0.0.0.0", port=5000, debug=False)

if __name__ == "__main__":
    main()
