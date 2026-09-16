# AXON — Claude Code Master Instructions
## Adaptive eXtended-bridge Operational Network

**Every Claude Code session must read this file first before doing anything.**

---

## Project Identity

- **Project Name:** AXON (Adaptive eXtended-bridge Operational Network)
- **Type:** Three-layer Edge-AI IIoT framework for infrastructure anomaly detection
- **GitHub:** github.com/SaiSugeet/axon-iiot
- **Live Dashboard:** axon-iiot.vercel.app
- **Login:** SaiSugeet / 2004
- **Subject Code:** 22EEE65 | New Horizon College of Engineering | 2025-26
- **Lead:** G Sai Sugeet | Guide: Dr. Agalya

---

## System Architecture (Read This Every Session)

Pi Zero 2W (Edge Node)
↓ MQTT QoS2 over Wi-Fi
Android Phone — Termux (Bridge)
SQLite buffer (13.8 hours), paho-mqtt relay, wake lock required
↓ MQTT over hotspot LAN
Central Server — Ubuntu Laptop (192.168.1.12)
FFT → Isolation Forest → IASI → Random Forest → Flask API
↓ HTTPS POST every 2 seconds
Render (Cloud Relay)
↓ HTTPS GET every 2 seconds
Vercel Dashboard (axon-iiot.vercel.app)


---

## Repository Structure

axon-iiot/
├── app/ # Next.js App Router pages
├── components/ # 13 React dashboard components
├── hooks/useSimulation.ts # ALL synthetic data generation — do not change ML logic here
├── lib/constants.ts # Scenarios, IASI ranges, credentials
├── axon-server/ # Python backend (Phase 2)
│ ├── main.py # Entry point — run this to start server
│ ├── config.py # All configuration constants
│ ├── database.py # SQLite schema and queries
│ ├── fft_processor.py # 7-feature FFT extraction
│ ├── ml_models.py # Isolation Forest + Random Forest
│ ├── mqtt_subscriber.py # MQTT listener and pipeline trigger
│ ├── flask_api.py # REST API — 6 endpoints
│ ├── models/ # Saved .joblib model files
│ └── requirements.txt
├── axon-bridge/ # Android Termux CLI (Phase 3 — not built yet)
├── brain/ # Reference markdown files (to be created)
└── CLAUDE.md # This file


---

## Critical Rules — Never Violate These

1. **Never change hooks/useSimulation.ts ML logic** — simulation data generation is intentional
2. **Never rename MQTT topics** — railway/vibration, railway/obstacle, railway/system/heartbeat
3. **Never change the IASI formula** without checking the formula below first
4. **Never use random_state other than 42** for ML models — reproducibility required
5. **Always use --break-system-packages** when running pip install on this Ubuntu machine
6. **Never expose the Flask API without the X-API-Key header** on POST endpoints
7. **The dashboard credentials are SaiSugeet / 2004** — do not change them

---

## IASI Formula (Source of Truth)

```python
IASI = (vibration_score * 0.85 * 100) + (signal_continuity * 0.15 * 100)

# Override logic (applied after formula):
if vibration_score >= 0.85: IASI = max(IASI, 80)
elif vibration_score >= 0.65: IASI = max(IASI, 55)

IASI = clamp(IASI, 0, 100)
```

Classifications: 0-25 = SAFE | 26-50 = MONITOR | 51-75 = ALERT | 76-100 = CRITICAL

---

## MQTT Configuration

- Broker: localhost port 1883 (Mosquitto on this Ubuntu machine)
- Topics: railway/vibration | railway/obstacle | railway/system/heartbeat
- QoS: 2 (exactly once)
- Packet format: JSON with seq, ts, scenario, samples fields
- Heartbeat: every 30 seconds from Pi Zero 2W

---

## Server Configuration

- **This machine IP:** 192.168.1.12
- **Flask port:** 5000
- **API Key:** axon-server-key-2025
- **DB file:** axon-server/axon_data.db
- **Models:** axon-server/models/isolation_forest_v1.joblib + random_forest_v1.joblib

---

## How to Start the Backend

```bash
cd /home/sugeetdev/Desktop/axon/axon-iiot/axon-server
sudo systemctl start mosquitto
python3 main.py
```

Test: `curl http://localhost:5000/health`
Expected: `{"service":"AXON Central Server","status":"online"}`

---

## Task-Specific File Reading Guide

| Task | Read These First |
|------|-----------------|
| Hardware work | axon-server/config.py + this file |
| ML/IASI changes | axon-server/ml_models.py + formula above |
| Dashboard work | hooks/useSimulation.ts + lib/constants.ts |
| API changes | axon-server/flask_api.py |
| MQTT changes | axon-server/mqtt_subscriber.py + config.py |
| Bridge/CLI work | axon-bridge/ folder (Phase 3) |
| Paper content | brain/12_PAPER_ROADMAP.md (when created) |

---

## Current Phase Status

- Phase 1 (Simulation Dashboard): COMPLETE — live at axon-iiot.vercel.app
- Phase 2 (Backend + Hardware): IN PROGRESS
- Phase 3 (Android CLI + Paper): PLANNED

---

## What Has NOT Been Built Yet

- axon-bridge/ folder and CLI (Phase 3)
- brain/ folder markdown files
- Real MPU6050 hardware integration
- Android Termux bridge scripts
- Render cloud deployment

---

## Five Scenario Parameters (Simulation Reference)

| Scenario | IASI Range | FFT Peak | Classification |
|----------|-----------|----------|----------------|
| NORMAL | 5-18 | 5 Hz | SAFE |
| JOINT_FAULT | 22-38 | 18 Hz | MONITOR |
| LOOSE_FASTENER | 15-30 | 14 Hz | MONITOR |
| RAIL_CRACK | 38-54 | 26 Hz | ALERT |
| SEVERE_DAMAGE | 60-92 | 40+46 Hz | CRITICAL |

---

*AXON v2.0 | 22EEE65 | New Horizon College of Engineering | 2025-26*
