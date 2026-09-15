# AXON

*IRMS · EDGE-AI · TRACK HEALTH MONITOR*

![Phase](https://img.shields.io/badge/Phase-1%20Prototype-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live%20on%20Vercel-brightgreen?style=flat-square)
![Framework](https://img.shields.io/badge/Framework-Next.js%2014-black?style=flat-square&logo=next.js)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

AXON (Adaptive eXtended-bridge Operational Network) — A three-layer Edge-AI IIoT framework for real-time infrastructure anomaly detection in transportation systems. Edge Node (Pi Zero 2W) → Android Termux Bridge → Central Server → Live Dashboard.

---

## ⚠️ Prototype Notice

> **This is a Phase 1 simulation prototype.**
>
> - All sensor data (vibration, obstacle detection, IRMS scores) is **synthetically generated in the browser**
> - No physical hardware is connected in this phase
> - The full system (Raspberry Pi Zero 2W + Android Bridge + Ubuntu Server) will be integrated in Phase 2
> - This prototype demonstrates the complete dashboard UI, data visualization, and IRMS scoring logic

---

## 🚆 Project Overview

Indian Railways operates over 67,000 km of track across the country. Manual track inspection is conducted only once every 3–6 months, leaving a significant window during which cracks, joint failures, loose fasteners, and other structural faults go undetected — posing serious risks to passenger safety and infrastructure.

AXON is the dashboard layer of an onboard edge-AI system designed to monitor track health on every train run. By mounting a vibration sensor (MPU6050) and a small AI module on the train, the system continuously analyses track conditions in real time — detecting anomalies, classifying faults, and surfacing hazards to a central safety operations console.

At the core of the system is the **IRMS (Infrastructure Risk Monitoring Score)** — a single 0–100 composite score that combines vibration health, obstacle detection confidence, and communication reliability into one actionable metric. Operators can respond to track degradation before it becomes a failure.

This Phase 1 prototype delivers the complete visualisation layer: the IRMS gauge, risk classification logic, FFT vibration spectrum, obstacle detection log, and all five track fault scenarios — all driven by synthetic data that faithfully mimics real sensor output.

---

## 🏗️ System Architecture

| Layer | Component | Role |
|-------|-----------|------|
| Layer 1 | Raspberry Pi Zero 2W | Edge device — collects MPU6050 vibration and camera data onboard the train |
| Layer 2 | Android Phone (Termux) | MQTT bridge — relays data from the Pi, provides 72-hour offline buffer |
| Layer 3 | Laptop / Ubuntu Server | ML processing — Isolation Forest + Random Forest models, Flask REST API |
| Layer 4 | Vercel + Render | Dashboard + API hosting — live browser visualisation and operator console |

> **In this Phase 1 prototype, Layers 1–3 are simulated synthetically inside the browser. The dashboard (Layer 4) is fully functional.**

---

## 📊 IRMS — Infrastructure Risk Monitoring Score

The IRMS is a composite 0–100 score computed from three weighted sub-scores:

```
IRMS = (Vibration Score × 50) + (Obstacle Score × 35) + (Communication Score × 15)
```

| Classification | IRMS Range | Color |
|---------------|------------|-------|
| SAFE | 0 – 25 | 🟢 Green |
| MONITOR | 26 – 50 | 🟡 Yellow |
| ALERT | 51 – 75 | 🟠 Orange |
| CRITICAL | 76 – 100 | 🔴 Red |

An IRMS above 75 triggers a **CRITICAL** alert — operators are directed to halt traffic in the affected section and dispatch a field crew for immediate inspection.

---

## 🎮 Simulation Scenarios

The dashboard supports five track fault scenarios that can be switched live, each with realistic IRMS ranges and FFT frequency signatures:

| Scenario | Description | IRMS Range | Classification |
|----------|-------------|------------|----------------|
| NORMAL | Healthy track, baseline condition | 5 – 18 | SAFE |
| JOINT_FAULT | Rail joint loosening, periodic impulse signature | 22 – 38 | MONITOR |
| LOOSE_FASTENER | Bolt holding rail is loose, localised vertical oscillation | 15 – 30 | MONITOR |
| RAIL_CRACK | Crack forming in the rail, sub-surface defect signature | 38 – 54 | ALERT |
| SEVERE_DAMAGE | Major structural failure, multi-band vibration anomalies | 60 – 92 | CRITICAL |

---

## ✨ Dashboard Features

- 🔐 **Operator login** with secure hardcoded credentials and localStorage session persistence
- 📡 **Live device status cards** — Raspberry Pi Zero 2W, Android MQTT Bridge, Ubuntu Server
- 🎛️ **Scenario control panel** — switch between 5 track fault conditions in real time
- 📈 **IRMS Gauge** — animated semicircular SVG dial, 0–100, colour-coded by risk class
- 🏷️ **Risk Classification Badge** — auto-graded SAFE / MONITOR / ALERT / CRITICAL with pulsing animations
- 📉 **IRMS Trend Line** — last 60 readings at 1 Hz, live-updating Recharts line chart
- 📊 **FFT Power Spectrum Chart** — 51 frequency bins (0–50 Hz), updates every 5 seconds
- 🚧 **Obstacle Detection Log** — real-time YOLO-nano simulation log with per-class confidence bars
- 🖥️ **System Health Panel** — packet counts, scenario uptime, API response time, model confidence
- 📱 **Fully responsive** — desktop (1440px), tablet (768px), and mobile (375px)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework, App Router, static export |
| Tailwind CSS | Utility-first styling, responsive layout |
| Recharts | IRMS trend line and FFT vibration spectrum charts |
| Lucide React | SVG icon system |
| Google Fonts — Rajdhani + JetBrains Mono | Display and monospace typography |
| Vercel | Hosting and continuous deployment |

---

## 🚀 Getting Started

**Prerequisites**
- Node.js 18+
- npm or yarn

**Installation**

```bash
git clone https://github.com/YOUR_USERNAME/axon-iiot.git
cd axon-iiot
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Login credentials (prototype)**

```
Username: axon_admin
Password: EdgeAI@2025
```

---

## 📦 Deployment on Vercel

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **New Project** → Import your GitHub repository
4. Vercel auto-detects Next.js — click **Deploy**
5. Your dashboard goes live at `https://axon-iiot.vercel.app`

> Every future `git push` to the `main` branch automatically redeploys to Vercel.

---

## 📁 Project Structure

```
axon-iiot/
├── app/
│   ├── layout.tsx              # Root layout — Google Fonts, metadata
│   ├── page.tsx                # Entry point — login gate / dashboard router
│   └── globals.css             # CSS variables, Tailwind base, animations
├── components/
│   ├── LoginPage.tsx           # Operator login screen
│   ├── Dashboard.tsx           # Main dashboard shell
│   ├── Navbar.tsx              # Top navigation bar
│   ├── DeviceStatusStrip.tsx   # 3 device status cards
│   ├── ScenarioControl.tsx     # 5 scenario buttons
│   ├── IRMSGauge.tsx           # SVG semicircular arc gauge
│   ├── RiskBadge.tsx           # Risk classification badge
│   ├── TrackStateIndicator.tsx # Scenario label + animated waveform
│   ├── IRMSTrendChart.tsx      # Recharts 60-point line chart
│   ├── FFTSpectrumChart.tsx    # Recharts 51-bin bar chart
│   ├── ObstacleLog.tsx         # Scrollable detection table
│   └── SystemHealth.tsx        # System stats panel
├── hooks/
│   └── useSimulation.ts        # Central simulation hook — all synthetic data
├── lib/
│   └── constants.ts            # Scenarios, IRMS ranges, colour maps, credentials
├── types/
│   └── index.ts                # TypeScript interfaces
├── public/
│   └── ir-logo.svg             # GR monogram SVG
├── vercel.json                 # Vercel deployment config
├── next.config.js              # Static export config
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🗺️ Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Simulation dashboard prototype — full UI, IRMS logic, 5 fault scenarios |
| Phase 2 | 🔄 Planned | Raspberry Pi Zero 2W integration with real MPU6050 vibration sensor |
| Phase 3 | 🔄 Planned | Android MQTT bridge + Ubuntu server ML pipeline (Isolation Forest + Random Forest) |
| Phase 4 | 🔄 Planned | GPS fault tagging, multi-train support, YOLOv8n real-time obstacle inference |

---

## 👥 Team

| Name | Role |
|------|------|
| G Sai Sugeet | Lead Developer & System Architect |
| John Benny J | ML Pipeline & IRMS Algorithm |
| Neetha Udupa G | Communication Architecture |
| S D Mukhesh | Hardware Integration & Testing |

**Guide:** Dr. Agalya, Assistant Professor
**Institution:** Dept. of Electrical & Electronics Engineering, New Horizon College of Engineering, Bengaluru — 560103

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use for educational purposes.

---

```
Built with ❤️ for Indian Railways Safety | New Horizon College of Engineering | 2025–26
22EEE65 | Department of Electrical & Electronics Engineering
```
