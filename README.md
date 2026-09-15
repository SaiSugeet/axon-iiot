# AXON

*IASI · EDGE-AI · INFRASTRUCTURE ANOMALY DETECTION*

![Phase](https://img.shields.io/badge/Phase-1%20Prototype-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live%20on%20Vercel-brightgreen?style=flat-square)
![Framework](https://img.shields.io/badge/Framework-Next.js%2014-black?style=flat-square&logo=next.js)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**AXON (Adaptive eXtended-bridge Operational Network)** — A three-layer Edge-AI IIoT framework for real-time infrastructure anomaly detection in transportation systems.

Edge Node (Pi Zero 2W) → Android Termux Bridge → Central Server → Live Dashboard

---

## ⚠️ Prototype Notice

> **This is a Phase 1 simulation prototype.**
>
> - All sensor data (vibration, obstacle detection, IASI scores) is **synthetically generated in the browser**
> - No physical hardware is connected in this phase
> - The full system (Raspberry Pi Zero 2W + Android Termux Bridge + Ubuntu Server) will be integrated in Phase 2
> - This prototype demonstrates the complete dashboard UI, data visualization, and IASI scoring pipeline

---

## 🚆 Project Overview

Transportation infrastructure — railway tracks, urban roads, industrial pathways — degrades continuously between inspection cycles. Manual railway track inspection is conducted only once every 3–6 months, leaving a significant window during which cracks, joint failures, loose fasteners, and other structural faults go undetected.

AXON is a domain-agnostic edge-AI IIoT framework that monitors infrastructure health on every vehicle run. A low-cost edge node (Raspberry Pi Zero 2W + MPU6050 vibration sensor) captures structural signals continuously. Data travels through a resilient Android Termux MQTT bridge — with local SQLite offline buffering — to a central server running FFT analysis, Isolation Forest anomaly detection, and Random Forest severity classification.

At the core of the system is the **IASI (Infrastructure Anomaly Severity Index)** — a generic two-component composite score that quantifies infrastructure risk in real time. The same architecture applies to railway track monitoring, urban road quality assessment, and fleet vehicle health monitoring.

---

## 🏗️ System Architecture

| Layer | Component | Role |
|-------|-----------|------|
| Layer 1 | Raspberry Pi Zero 2W | Edge sensing node — MPU6050 vibration at 500Hz, MQTT publishing |
| Layer 2 | Android Phone (Termux) | Resilient MQTT bridge — SQLite offline buffer, automatic replay on reconnect |
| Layer 3 | Laptop / Ubuntu Server | ML processing — FFT, Isolation Forest, Random Forest, IASI engine, Flask REST API |
| Layer 4 | Vercel + Render | Dashboard + API hosting — live browser visualization and operator console |

> **In this Phase 1 prototype, Layers 1–3 are simulated synthetically inside the browser. Layer 4 (this dashboard) is fully functional and live.**

---

## 📊 IASI — Infrastructure Anomaly Severity Index

The IASI is a generic two-component composite score computed as:

IASI = (Vibration Anomaly Score × W1) + (Signal Continuity × W2)


Where W1 and W2 are domain-specific weights derived via the Analytic Hierarchy Process (AHP). For railway track monitoring: W1 = 0.85, W2 = 0.15.

| Classification | IASI Range | Meaning |
|---------------|------------|---------|
| SAFE | 0 – 25 | Normal operating conditions |
| MONITOR | 26 – 50 | Early degradation detected — increase inspection frequency |
| ALERT | 51 – 75 | Significant anomaly — schedule maintenance within 48 hours |
| CRITICAL | 76 – 100 | Severe structural risk — halt traffic, dispatch field crew immediately |

---

## 🎮 Simulation Scenarios

Five fault severity scenarios with realistic IASI ranges and FFT frequency signatures:

| Scenario | Description | IASI Range | Classification |
|----------|-------------|------------|----------------|
| NORMAL | Healthy infrastructure, baseline condition | 5 – 18 | SAFE |
| JOINT_FAULT | Rail joint loosening — periodic impulse signature at 18Hz | 22 – 38 | MONITOR |
| LOOSE_FASTENER | Loose fastener — localized vertical oscillation at 14Hz | 15 – 30 | MONITOR |
| RAIL_CRACK | Rail crack forming — sub-surface defect signature at 26Hz | 38 – 54 | ALERT |
| SEVERE_DAMAGE | Major structural failure — multi-band anomaly at 40Hz + 46Hz | 60 – 92 | CRITICAL |

---

## ✨ Dashboard Features

- 🔐 **Operator authentication** — secure login with session persistence
- 📡 **Live device status** — Pi Zero 2W, Android Bridge, Central Server status indicators
- 🎛️ **Scenario control panel** — switch between 5 fault conditions in real time
- 📈 **IASI Gauge** — animated semicircular SVG dial, 0–100, color-coded by risk class
- 🏷️ **Risk Classification Badge** — SAFE / MONITOR / ALERT / CRITICAL with live state
- 📉 **IASI Trend Line** — last 60 readings at 1Hz, rolling Recharts line chart
- 📊 **FFT Power Spectrum** — 51 frequency bins (0–50Hz), dominant frequency highlighted
- 🚧 **Obstacle Detection Log** — event log with class, confidence bars, and status flags
- 📡 **Signal Continuity Gauge** — Android bridge health indicator
- 🖥️ **System Telemetry** — Pi packet count, uptime, Android ping, server push latency
- 🌐 **Responsive layout** — desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework, App Router |
| Tailwind CSS | Utility-first styling, responsive layout |
| Recharts | IASI trend line and FFT vibration spectrum charts |
| Lucide React | SVG icon system |
| Google Fonts — Inter + JetBrains Mono | Clean sans-serif + monospace typography |
| Vercel | Hosting and continuous deployment from GitHub |

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/SaiSugeet/GuardRail-Central.git
cd GuardRail-Central
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Login credentials:**

Operator ID: SaiSugeet
Access Code: 2004


---

## 📦 Deploy on Vercel

1. Push to GitHub
2. Import repository at [vercel.com](https://vercel.com)
3. Vercel auto-detects Next.js — click Deploy
4. Every `git push` to `main` auto-redeploys

---

## 📁 Project Structure

```text
axon/
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata
│   ├── page.tsx                # Entry point — login gate / dashboard router
│   └── globals.css             # CSS variables, Tailwind base, animations
├── components/
│   ├── LoginPage.tsx           # Operator authentication screen
│   ├── Dashboard.tsx           # Main dashboard shell and layout
│   ├── Navbar.tsx              # Top navigation bar
│   ├── DeviceStatusStrip.tsx   # Pi / Bridge / Server status cards
│   ├── ScenarioControl.tsx     # Fault scenario selector
│   ├── IRMSGauge.tsx           # IASI semicircular arc gauge
│   ├── RiskBadge.tsx           # Risk classification badge
│   ├── SignalContinuity.tsx    # Bridge health vertical gauge
│   ├── IRMSTrendChart.tsx      # 60-point rolling IASI trend line
│   ├── FFTSpectrumChart.tsx    # 51-bin FFT power spectrum
│   ├── ObstacleLog.tsx         # Obstacle detection event table
│   └── SystemTelemetry.tsx     # System stats readout panel
├── hooks/
│   └── useSimulation.ts        # Central simulation hook — all synthetic data
├── lib/
│   └── constants.ts            # Scenarios, IASI ranges, color maps, credentials
├── types/
│   └── index.ts                # TypeScript interfaces
├── public/                     # Static assets
├── vercel.json                 # Vercel deployment config
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # Project documentation
```


---

## 🗺️ Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Simulation dashboard — full UI, IASI logic, 5 fault scenarios |
| Phase 2 | 🔄 In Progress | Pi Zero 2W + MPU6050 real sensor integration, axon-server backend |
| Phase 3 | 🔄 Planned | Android Termux CLI bridge, end-to-end pipeline validation |
| Phase 4 | 🔄 Planned | GPS fault tagging, road quality monitoring, multi-vehicle support |

---

## 👥 Team

| Name | Role |
|------|------|
| G Sai Sugeet | Lead Developer & System Architect |
| S D Mukhesh | Backend Development & Testing |
| John Benny J | Hardware Integration & Testing |
| Neetha Udupa G | Hardware Integration & Communication |

**Guide:** Dr. Agalya, Assistant Professor
**Institution:** Dept. of Electrical & Electronics Engineering, New Horizon College of Engineering, Bengaluru — 560103
**Subject Code:** 22EEE65 | **Academic Year:** 2025–26

---

## 📄 License

MIT License — free to use for educational and research purposes.

---

AXON v2.0 | Phase 1 Simulation Prototype
Built for IEEE Publication | New Horizon College of Engineering | 2025–26
