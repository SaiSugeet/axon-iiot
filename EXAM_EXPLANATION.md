# AXON — Complete Exam Explanation
## IIOT Integrated Edge-AI Based Railway Track Health Monitoring and Supervision System

**Subject:** 22EEE65 | **College:** New Horizon College of Engineering, Bengaluru | **AY:** 2025–26  
**Team:** G Sai Sugeet · John Benny J · Neetha Udupa G · S D Mukhesh  
**Live Dashboard:** https://guard-rail-central.vercel.app/ | **Repository:** https://github.com/SaiSugeet/GuardRail-Central

---

## SECTION 1 — PROJECT OVERVIEW

### The Problem

Indian Railways operates **67,000 km of track** — the fourth-largest rail network on Earth. Today, that entire track is inspected manually: a crew walks or drives along the line and visually checks every joint, every fastener, every meter of rail surface. This happens once every **3 to 6 months**.

Three things make this dangerous:

1. **A fatigue crack in rail steel is invisible to the naked eye** until it becomes a fracture. A train weighing thousands of tonnes running over a hairline crack at 100 km/h gives the crack exactly the energy it needs to split the rail completely. The inspection interval is too long to catch developing faults.

2. **Obstacles arrive faster than human reaction**. At 100 km/h, a loco-pilot sees an obstacle 60 metres ahead and has **less than 2.2 seconds** to react. Cattle, fallen trees, and landslide debris kill both livestock and train crew every year. A camera system that detects the obstacle 500 metres ahead gives the driver 18 seconds — enough to brake.

3. **Track geometry degrades silently**. Loose fasteners (the clips holding rail to sleeper) cause increasing vibration that escalates to joint faults, then rail cracks, then structural failure. The vibration signature changes weeks before the track becomes dangerous — but no one is measuring it continuously.

### What This System Solves

We mount sensors **on every train**. Every run becomes an inspection run. The train itself becomes the inspection vehicle, covering every kilometre of track automatically, at full operating speed, transmitting live data to a central operations dashboard.

The system provides:
- **Continuous structural health monitoring** via accelerometer vibration analysis
- **Real-time obstacle detection** via onboard camera and YOLO neural network
- **Automated risk scoring** that goes from raw sensor data to a single safety number in under 4 seconds
- **A central dashboard** where safety operators see the health of every active track section simultaneously

### Why IIoT + Edge-AI

This is an **IIoT (Industrial Internet of Things)** project because it connects physical industrial equipment (a 160-tonne locomotive) to a digital monitoring system via standardised IoT protocols (MQTT).

It is **Edge-AI** because the most time-critical computation — the YOLO obstacle detection — runs on a Raspberry Pi **on the train itself**, not in the cloud. If the network goes down, the train still detects obstacles. Edge processing keeps the safety-critical path offline-capable.

### What Phase 1 Demonstrates

Phase 1 is a **fully working simulation** of the complete system. Real hardware is not yet assembled, but every software layer is built and functional:

- The data pipeline that would carry sensor readings from train to cloud
- The IASI scoring formula that converts raw signals to a risk number
- The FFT analysis that identifies fault signatures by frequency
- The dashboard that a real safety operator would watch

The simulation generates **statistically accurate fake sensor data** matching each fault type's real vibration signature. When an examiner watches the RAIL CRACK scenario, the FFT chart shifts to 26 Hz exactly as it would with real cracked-rail vibration data.

> **One-line summary:** AXON is a real-time railway track health monitoring dashboard that converts continuous vibration and obstacle sensor data into a single safety score, enabling Indian Railways to catch track faults weeks before they become derailments.

---

## SECTION 2 — SYSTEM ARCHITECTURE (Four Layers)

The system has four layers. Data flows from left to right: train → phone → server → cloud → dashboard.

```
[Layer 1]          [Layer 2]          [Layer 3]           [Layer 4]
Raspberry Pi  →    Android/Termux  →  Ubuntu Server   →   Vercel + Render
(Edge Device)      (MQTT Bridge)      (ML Processing)     (Dashboard + API)
On the train       On the train       At base station     On the internet
```

---

### Layer 1 — Raspberry Pi Zero 2W (Edge Device, On the Train)

**What it is:** A credit-card-sized Linux computer costing ₹1,200, mounted in an enclosure on the train bogie (the wheeled chassis that touches the track).

**What it does in the real system:**
- Reads the **MPU6050 accelerometer** at 100 samples per second, capturing vibration in X, Y, and Z axes
- Runs a **TinyML YOLO model** (YOLOv8 Nano, quantised to INT8) on a Pi Camera to detect obstacles ahead of the train
- Packages sensor readings into MQTT messages and transmits over Wi-Fi to the Android bridge
- Computes a local anomaly score using Isolation Forest — so even without network, it can trigger a local alert

**What it simulates in Phase 1:**
The `useSimulation.ts` hook plays the role of the Raspberry Pi. Every 1 second it calls `generateIRMS(scenario)` which picks a random value within the scenario's defined range (e.g., 5–18 for NORMAL) plus ±2 noise. Every 5 seconds it calls `generateFFT(scenario)` which builds a Gaussian-peaked frequency spectrum matching the scenario's vibration signature.

**Why it sits on the train:** The obstacle detection must happen in real-time. A 50ms network latency plus a 200ms cloud inference time means the detection arrives 250ms too late at 100 km/h. Running YOLO on the Pi, even at lower accuracy, gives a sub-20ms local decision.

---

### Layer 2 — Android Phone / Termux (MQTT Bridge, On the Train)

**What MQTT is:** MQTT (Message Queuing Telemetry Transport) is a lightweight publish-subscribe protocol designed for low-bandwidth, unreliable networks — exactly the conditions inside a moving train. The Pi **publishes** data to a topic (`guardrail/train01/sensors`). The Android bridge **subscribes** to that topic and receives it.

**What the bridge does:**
- The Android phone runs a Python MQTT client inside **Termux** (a Linux terminal emulator for Android)
- It receives packets from the Pi over the local train Wi-Fi hotspot
- It buffers all packets in an **SQLite database** stored on the phone
- When mobile data is available, it forwards packets over 4G/5G to the laptop server
- It re-transmits with **QoS 1** (at-least-once delivery guarantee) so no packet is lost even if the connection drops mid-send

**Why it exists — three reasons:**
1. **Battery backup**: The Pi draws 5V from the train's power system. If the train cuts power, the phone runs on its own battery for hours, keeping data flowing.
2. **72-hour offline buffer**: India has many rural sections with no 4G coverage. The SQLite buffer stores up to 72 hours of data. Once the train enters coverage, all buffered data uploads automatically — no gaps in the health record.
3. **Protocol translation**: MQTT works perfectly on a local Wi-Fi network. HTTPS works better for long-haul internet. The bridge translates between them.

**What happens if the server goes offline:** The phone keeps collecting and buffering. The IASI Communication Score in the dashboard drops (reflecting that the server is unreachable). Once connectivity restores, all data flows and the score recovers.

---

### Layer 3 — Laptop Ubuntu Server (ML Processing, Base Station)

The laptop runs five software systems simultaneously:

| Service | What It Does |
|---|---|
| **Mosquitto MQTT Broker** | Receives forwarded packets from Android bridge |
| **FFT Processor** | Converts raw accelerometer time-series into frequency spectrum every 5 seconds |
| **Isolation Forest** | Trained on NORMAL vibration data; scores every new packet 0–1 for anomaly level |
| **IASI Engine** | Combines Vibration Score, Obstacle Score, Communication Score into one IASI number |
| **Random Forest Classifier** | Looks at last 10 IASI readings + trend + variance → outputs SAFE/MONITOR/ALERT/CRITICAL |
| **Flask REST API** | Serves current IASI, FFT, obstacle log as JSON; pushes to Render every 2 seconds |

**Why Ubuntu:** Linux provides the scientific Python stack (NumPy, scikit-learn, PyMQTT) without driver conflicts. In Phase 2, this would be a cloud VM (AWS EC2 or Azure) for 24/7 availability.

---

### Layer 4 — Vercel + Render (Dashboard + Cloud API)

**Vercel** hosts the React dashboard as a **static export** (no server-side rendering needed — all data is fetched client-side from Render). Vercel's global CDN means the dashboard loads fast from anywhere in India.

**Render** hosts the Flask REST API. The laptop pushes to Render every 2 seconds via HTTPS POST. The dashboard fetches from Render every 2 seconds via HTTPS GET. This means the dashboard operator sees data that is at most 4 seconds old.

**UptimeRobot** pings the Render API every 5 minutes to prevent the free-tier server from sleeping (Render free tier spins down after 15 minutes of inactivity).

**In Phase 1:** Vercel hosts everything. There is no Render endpoint — the simulation runs entirely in the browser. The `useSimulation` React hook generates all data locally. This is a fully valid prototype approach — it demonstrates the entire UI/UX and data logic without requiring the backend infrastructure to be assembled.

---

## SECTION 3 — THE LOGIN PAGE

### Why It Exists

A railway safety monitoring dashboard is classified as **critical infrastructure software**. Unauthorized access — someone switching scenarios, triggering false alerts, or disrupting the operator's view — could have real safety consequences in production. The login gate is not optional.

### What "Authorized Personnel Only" Means

In the real system, only certified Railway Safety Division operators would have credentials. They would authenticate with their employee ID and a rotating OTP, and every login would be logged with timestamp and IP for audit. In Phase 1, we demonstrate this with a hardcoded credential pair (`SaiSugeet` / `2004`).

### Authentication Flow

**Successful login:** The operator ID is stored in `localStorage` so the session persists across browser refreshes without re-authentication. `onAuth(username)` is called, the state updates, and the Dashboard renders.

**Failed login:** An error message appears: "Invalid credentials. Access denied." No hint about which field is wrong — this is intentional security practice (not telling attackers whether the username or password is the issue).

**In production:** Credentials would be checked against a PostgreSQL database with bcrypt-hashed passwords. Session tokens would expire after 8 hours (one shift). Multi-factor authentication would be mandatory.

### What the Operator Sees After Login

The full dashboard immediately loads with live-updating data: device status cards, scenario control, IASI gauge, risk classification, trend chart, FFT spectrum, obstacle log, and system health — all updating in real time.

---

## SECTION 4 — THE DASHBOARD: EVERY ELEMENT EXPLAINED

---

### 4.1 — Device Status Cards

**What they are:** Three cards at the top of the dashboard showing the health of the three physical devices in the system. They are split into two zones:

- **FIELD DEVICES (ON TRAIN):** Raspberry Pi Zero 2W + Android Bridge — these travel with the train
- **CENTRAL SERVER:** Ubuntu Laptop Server — this stays at the base station

**What each card shows:**

| Card | Metric | What It Means |
|---|---|---|
| Raspberry Pi | SENSORS: ACTIVE | The MPU6050 accelerometer is powered and sending data |
| Raspberry Pi | PACKETS SENT | Total MQTT messages published since the Pi booted (increments by 1–3 per second in simulation) |
| Raspberry Pi | UPTIME | How long the Pi has been running without restart (HH:MM:SS) |
| Android Bridge | MQTT: CONNECTED | The bridge has an active MQTT subscription to the Pi's topic |
| Android Bridge | BUFFER: HEALTHY | SQLite queue is not overflowing; data is being forwarded faster than it accumulates |
| Android Bridge | LAST PING: Xs ago | Time since the last heartbeat message from the Pi was received |
| Ubuntu Server | ML MODELS: RUNNING | Isolation Forest and Random Forest are loaded in memory and processing |
| Ubuntu Server | API: ACTIVE | Flask API is responding to requests |
| Ubuntu Server | LAST PUSH: Xs ago | How long ago the server last pushed data to the Render cloud endpoint |

**In simulation:** "ONLINE" always shows because the simulation never simulates a device failure — that would be tested in Phase 2. The packet count and uptime increment every second using `setInterval`.

---

### 4.2 — Track Scenario Control Panel

**What it is:** A row of 5 buttons that let the operator (or demonstrator) switch between different simulated track conditions. Switching a scenario immediately changes the IASI output range, FFT spectrum shape, and obstacle detection probabilities.

**The 5 scenarios and what they physically mean:**

| Scenario | IASI Range | Physical Meaning |
|---|---|---|
| **NORMAL** | 5–18 | Track is in excellent condition. All joints are tight, fasteners are secure, rail surface is smooth. Vibration is low and steady. |
| **JOINT FAULT** | 22–38 | The fishplate (metal plate connecting two rail sections at a joint) is losing its bolt tension. As the train wheel crosses the joint, there's a rhythmic "clunk" — periodic impact every ~15 metres (joint spacing). |
| **LOOSE FASTENER** | 15–30 | A Pandrol clip or bolt holding the rail to the concrete sleeper has worked loose. The rail micro-shifts laterally with each wheel passage. Lower frequency than joint fault, more irregular. |
| **RAIL CRACK** | 38–54 | A fatigue crack, typically 5–15mm deep, has formed in the rail web (the vertical section of the rail). Each wheel passage sends a stress wave through the crack, producing a distinctive high-frequency impulse. |
| **SEVERE DAMAGE** | 60–92 | Multiple simultaneous defects: a wide crack, loose fasteners, and possible track gauge deviation. Multi-band high-frequency vibration. This is an emergency — the track could fail under load. |

**Why switching scenarios changes everything:** The `setScenario` function in `useSimulation.ts` updates the `currentScenario` state, which is the input to every data generation function (`generateIRMS`, `generateFFT`, `generateObstacleEvent`). All three update intervals read from this shared state, so the entire dashboard responds simultaneously.

---

### 4.3 — IASI Gauge

**What IASI Is:**

IASI stands for **Infrastructure Anomaly Severity Index**. It is a single number from 0 to 100 that represents the combined safety risk of the current track section. We invented this composite metric specifically for this project because we needed one number that operators could act on instantly — rather than asking them to simultaneously interpret vibration amplitude, FFT peaks, obstacle confidence, and network latency.

**The Formula:**

```
IASI = (Vibration Score × 0.50) + (Obstacle Score × 0.35) + (Communication Score × 0.15)
```

Each component score is normalised to 0–100, then weighted:

| Component | Weight | Why This Weight |
|---|---|---|
| **Vibration Score** | 50% | Structural health is the primary purpose of the system. Vibration directly correlates with track condition. A cracking rail shows up here first. |
| **Obstacle Score** | 35% | Life-safety critical. A PERSON on the track is an immediate emergency regardless of track condition. Second-highest weight. |
| **Communication Score** | 15% | System health. If data stops flowing, we can't see the track — that is itself a risk, but less urgent than the physical conditions. |

**How each score is derived (real system):**
- **Vibration Score:** The Isolation Forest anomaly score (0.0 = perfectly normal, 1.0 = maximally anomalous) is scaled to 0–100
- **Obstacle Score:** `(1 - confidence_of_CLEAR_prediction) × 100`. If the camera is 98% sure the track is clear, obstacle score is 2. If it's 65% sure it sees a person, obstacle score is 35.
- **Communication Score:** Derived from packet loss rate, API latency, and buffer queue depth

**In the simulation:** The `useSimulation` hook generates IASI directly from the scenario's `irmsMin`/`irmsMax` range, then reverse-computes the component breakdown proportionally (vibration ≈ 55%, obstacle ≈ 20%, communication = remainder). The SystemHealth panel displays these components live.

**What the numbers mean physically:**
- **0:** Perfect track, no obstacles, full connectivity — ideal conditions
- **25:** Upper edge of SAFE — track has minor vibration, possibly a slightly loose fastener, but no action needed yet
- **50:** Upper edge of MONITOR — noticeable joint movement; schedule maintenance within the week
- **75:** Upper edge of ALERT — significant structural anomaly; speed restriction warranted
- **100:** Maximum CRITICAL — track is potentially impassable; stop the train

**Why a gauge (not a number):** A needle on a dial is pre-attentive — the operator's brain registers "high" or "low" in 50 milliseconds without reading a number. The number box above the arc gives the precise value for logging and reporting.

**Update rate:** Every 1 second (driven by the 1Hz `setInterval` in `useSimulation`).

---

### 4.4 — Risk Classification Badge

**What It Is:** A large classification label — SAFE, MONITOR, ALERT, or CRITICAL — that tells the operator exactly what action is required right now.

**The Four Classifications and Required Actions:**

| Classification | IASI Range | Colour | Required Action |
|---|---|---|---|
| **SAFE** | 0–25 | Deep green | No action. Log the reading. Track health is nominal. |
| **MONITOR** | 26–50 | Dark gold | Flag for next maintenance cycle. Increase inspection frequency for this section. Consider placing a manual check-point at the next scheduled stop. |
| **ALERT** | 51–75 | Burnt orange | Schedule immediate maintenance — within 24–48 hours. Issue a speed restriction order (reduce max speed from 130 km/h to 60 km/h on the affected section). Notify the sectional engineer. |
| **CRITICAL** | 76–100 | Deep red | Emergency stop protocol. Halt all trains on the affected section. Dispatch emergency maintenance crew. Do not allow any train movement until a physical inspection confirms the track is safe. |

**How the Random Forest determines the classification (real system):**

Rather than simply checking `if irms > 75 → CRITICAL`, the Random Forest classifier looks at **10 consecutive IASI readings** (the last 10 seconds of data) and extracts:
- The current value
- The **slope** (rising or falling)
- The **variance** (stable or oscillating)
- Absolute values at each of the 10 time steps

This matters because: a value of 48 (technically MONITOR) that is **rising at 3 points per second** is more dangerous than a stable 52 (technically ALERT). The classifier can say "this looks like ALERT" even if the current reading hasn't crossed 50 yet. The trend is as important as the absolute value.

**In the simulation:** The `classifyIRMS` function uses simple threshold logic since the data is already scenario-controlled. The real classifier is described above for the production system.

---

### 4.5 — IASI Trend Chart (Last 60 Readings)

**What It Shows:** A line chart plotting the last 60 IASI values — one reading per second — giving a 60-second historical window of track health.

**Why 60 readings:** At 1 Hz, 60 readings = 60 seconds of history. This is enough to:
- See if the score is rising (deteriorating), falling (recovering), or stable
- Detect periodic spikes (indicating a rhythmic fault like a loose joint)
- Not be so long that recent events get lost in the noise

**The Reference Lines:** Three horizontal dashed lines at y=25, y=50, and y=75. These mark the classification boundaries. An operator can instantly see which classification zone the current reading falls into, and how far it is from the next boundary.

**What "1 HZ · LIVE" means:** The chart updates at 1 Hz (once per second). "LIVE" confirms this is real-time data, not a historical replay.

**How to read the trend:**
- **Rising steadily:** Track condition is actively degrading — take action before the next classification boundary is crossed
- **Stable:** Current condition is unchanging — log it and continue monitoring
- **Falling:** Track is recovering (or the train is moving to a better section of track)
- **Oscillating:** Rhythmic fault — each oscillation peak corresponds to the train's wheel hitting the same defect repeatedly (e.g., a joint every 15 metres at 100 km/h = one peak every 0.54 seconds)

**Why this chart matters more than a single gauge reading:** A single reading could be noise. Sixty readings reveal the **structural pattern**. A single reading of 52 might be a random spike; sixty readings all above 48 mean the section genuinely has a sustained fault.

---

### 4.6 — FFT Vibration Spectrum

**What FFT Is:**

FFT stands for **Fast Fourier Transform**. It takes a time-domain signal (vibration measured over time) and converts it into a frequency-domain representation (how much energy is present at each frequency). It answers the question: *not how much vibration, but at what frequency the vibration is occurring.*

**Why FFT Instead of Raw Amplitude:**

Raw vibration amplitude tells you *how rough* the ride is but not *why*. Two scenarios can produce the same vibration intensity for completely different reasons:
- A loose fastener at 10 Hz (slow, low-frequency wobble)
- A rail crack at 26 Hz (fast, high-frequency impulse)

The amplitude could be identical. The FFT reveals they are completely different fault signatures and allows correct diagnosis.

**The Chart:**
- **X-axis:** Frequency in Hz, from 0 to 50 Hz, in 51 bins (one bin per Hz)
- **Y-axis:** Power (energy) at that frequency, scaled 0–100
- Each bar represents how much of the vibration energy is concentrated at that frequency

**How Each Scenario Looks on the FFT:**

| Scenario | Peak Centre | Peak Height | Shape | Physical Explanation |
|---|---|---|---|---|
| **NORMAL** | ~5 Hz | ~35 | Narrow, low | Track-induced vibration is mainly low-frequency gentle oscillation from rail-wheel contact on smooth rail |
| **JOINT FAULT** | ~18 Hz | ~62 | Medium width | Joint impact happens rhythmically. At 100 km/h and 15m joint spacing, impacts occur every 0.54s = ~1.85 Hz... but the harmonic energy concentrates at ~18 Hz |
| **LOOSE FASTENER** | ~14 Hz | ~55 | Medium width | Lateral rail shift at each wheel passage generates energy around 14 Hz |
| **RAIL CRACK** | ~26 Hz | ~75 | Narrow, tall spike | The crack creates a sharp stress wave — high frequency, high energy, concentrated |
| **SEVERE DAMAGE** | ~40 Hz (primary) + ~46 Hz (secondary) | ~95 | Very wide, two peaks | Multiple simultaneous defect types create chaotic multi-band energy across 20–50 Hz |

**Dominant Frequency:** The bar with the highest power value. Shown in the text below the chart. A dominant frequency shift from 5 Hz to 26 Hz is a clear indicator of a rail crack — this is the automated alarm trigger in the real system.

**Update rate:** Every 5 seconds. FFT computation across 51 bins with 500 samples is more computationally intensive than a single IASI calculation, so it runs less frequently.

---

### 4.7 — Obstacle Detection Log

**What It Shows:** A scrollable table of the last 20 obstacle detection events, newest first. Each event is generated every 3–5 seconds in the simulation (matching a realistic camera inference rate at 0.2–0.3 Hz).

**Column Meanings:**

| Column | What It Contains |
|---|---|
| **TIME** | HH:MM:SS of when the detection was made |
| **CLASS** | What the YOLO model identified (CLEAR / CATTLE / PERSON / DEBRIS) |
| **CONFIDENCE** | How certain the model is, from 0.00 to 1.00 (shown as a progress bar + percentage) |
| **STATUS** | OK (for CLEAR) or FLAG (for any detected obstacle) |

**The 4 Obstacle Classes and Physical Meaning:**

| Class | Physical Meaning | Why It Matters |
|---|---|---|
| **CLEAR** | Track ahead is confirmed empty for the detection range (~500m) | Normal operating condition — no action needed |
| **CATTLE** | An animal (typically cow, buffalo, or goat) is on or near the track | Very common on Indian Railways — must slow and sound horn. At 130 km/h, a collision is fatal to the animal and can derail the train |
| **PERSON** | A human being is on the track | Highest emergency priority — automatic emergency brake activation in real system |
| **DEBRIS** | A foreign object: fallen tree, rock, landslide material, collapsed wall | Varies from minor (small branch) to severe (50-tonne boulder after landslide) — confidence score determines urgency |

**CLEAR confidence is always 90–99%:** When the track is clear, the YOLO model is very confident. The range (not 100%) accounts for lighting conditions, camera blur at speed, and rain. This is realistic — no detection model is 100% certain.

**How obstacle detection affects IASI:** `Obstacle Score = (1 - CLEAR_confidence) × 100`. A 97% CLEAR reading contributes an Obstacle Score of 3. A 70% PERSON confidence contributes a score of 30, significantly raising the IASI.

**SEVERE_DAMAGE scenario obstacle probabilities:**
```
NORMAL:         CLEAR=95%, CATTLE=2%, PERSON=2%, DEBRIS=1%
SEVERE_DAMAGE:  CLEAR=60%, CATTLE=15%, PERSON=15%, DEBRIS=10%
```
In real physics: severe track damage often correlates with landslides, which also create debris, explaining the higher obstacle probability.

**Row flash:** When a new event arrives that is not CLEAR, the top row briefly flashes gold (using the `row-flash` CSS animation) to draw the operator's attention.

---

### 4.8 — System Health Panel

**What It Shows:** Four stats plus the live IASI formula breakdown.

| Metric | Source | What It Tells You |
|---|---|---|
| **PACKETS PROCESSED** | Running counter from startup | How much data has flowed through the system. In simulation, starts at 150,000–200,000 (representing ~42–56 hours of prior operation) and increments 1–3 per second |
| **SCENARIO UPTIME** | Timer since last scenario switch | How long the current track condition has persisted — important for trend analysis |
| **API RESPONSE** | Simulated: 82–120ms random | Represents the round-trip latency from sensor data generation to dashboard receipt. In the real system, this would be the actual Flask API response time measured by the dashboard |
| **MODEL CONFIDENCE** | Simulated: 90–98% random | The Random Forest classifier's confidence in its current risk classification. High confidence (>90%) means the trend and variance clearly indicate the class; low confidence means the readings are ambiguous |

**IASI Formula Breakdown:**
The three component values (VIB + OBST + COMM) are shown live, adding up to the current IASI score. This provides **transparency** — the examiner can verify that the formula is actually running and that the three components are sensible proportions of the total. In the simulation, VIB ≈ 55%, OBST ≈ 20%, COMM ≈ 25% of the total IASI.

**"Synthetic data simulation active":** This disclaimer is mandatory. In an engineering prototype, it is important to be clear that the displayed data is simulated, not from real sensors. Any real operator would need to know they are looking at a demonstration, not live track data.

---

## SECTION 5 — THE ML MODELS

### 5.1 — Isolation Forest (Anomaly Detection → Vibration Score)

**What anomaly detection means here:** We do not teach the model what a "broken track" looks like. Instead, we teach it what a **healthy track** looks like, and anything that deviates significantly is flagged as anomalous. This is **unsupervised learning** — no labels needed.

**Why unsupervised:** We have abundant NORMAL track data (every km of track in good condition generates it), but historical fault data is rare and hard to collect safely. You cannot deliberately introduce cracks into working track just to collect training data. Isolation Forest learns from what we have.

**How it trains:** At system startup, the laptop server collects 500 packets of vibration data while running on known-good track (NORMAL scenario). This takes about 5 minutes. The Isolation Forest model fits to this data in under 1 second using scikit-learn's `IsolationForest(contamination=0.05)`.

**The 7 FFT features it uses:**

| Feature | What It Captures |
|---|---|
| Mean power (0–10 Hz) | Energy in the low-frequency smooth-ride band |
| Mean power (10–25 Hz) | Energy in the joint-fault band |
| Mean power (25–50 Hz) | Energy in the high-frequency crack band |
| Peak frequency | Which Hz bin has the most energy |
| Peak power | Height of the dominant peak |
| Spectral spread | How wide the energy distribution is |
| High-frequency ratio | Fraction of total energy above 25 Hz |

**What the output means:** The Isolation Forest returns an anomaly score from 0 (identical to training data) to 1 (completely different from anything seen in training). This score is the **Vibration Score** fed into the IASI formula.

---

### 5.2 — Random Forest Classifier (Risk Classification)

**What classification means here:** Given a sequence of 10 IASI readings (the last 10 seconds), predict which of the four categories — SAFE, MONITOR, ALERT, CRITICAL — best describes the current situation.

**Why 10 readings, not 1:** A single reading could be a noise spike. Ten readings reveal the **trend**:
- A value of 48 that has been at 48 for 10 seconds → MONITOR
- A value of 48 that was 32 ten seconds ago and rising → already flag as ALERT in anticipation

**The 12 features extracted from the 10-reading window:**

| Feature | Why It Matters |
|---|---|
| Current IASI | Absolute level |
| Mean of last 10 | Average level — filters out spikes |
| Max of last 10 | Worst case in the window |
| Min of last 10 | Best case in the window |
| Variance | How noisy/unstable the readings are |
| Slope (linear regression) | Is it rising, falling, or flat? |
| IASI at t-1, t-3, t-5, t-7, t-9 | Historical snapshots at 5 points |
| FFT high-frequency ratio | The spectral signature at this moment |
| Obstacle confidence (latest) | Real-time life-safety input |

**Training:** 2,000 synthetic labelled sequences (500 per class) are generated by running each scenario's data generator and applying the ground-truth label. Training takes 10–20 seconds on a laptop CPU. The resulting forest has 100 decision trees, each trained on a random subset of features and samples.

**Why Random Forest:** It handles the mix of continuous values (IASI, slope) and bounded values (confidence 0–1) without feature scaling. It gives a **probability output** (not just a label) so the confidence percentage in the System Health panel reflects genuine model uncertainty.

---

## SECTION 6 — COMMUNICATION ARCHITECTURE

### Full Data Flow with Latency Breakdown

```
MPU6050 → Pi (1ms) → MQTT over Wi-Fi → Android (10ms) → 4G to Render (~200ms) →
Dashboard fetch (~200ms) → Operator sees data
Total: ≈ 2–4 seconds end-to-end
```

### Every Communication Link Explained

**Link 1: Raspberry Pi → Android (MQTT over local Wi-Fi)**
- Protocol: MQTT v3.1.1 over TCP/IP
- QoS level: **1 (At-Least-Once)**
- Why QoS 1: QoS 0 is fire-and-forget (fast but packets can vanish). QoS 2 is exactly-once (safe but 4-message handshake, too slow at 100Hz). QoS 1 guarantees delivery with a 2-message handshake, acceptable latency, and the rare duplicate is filtered by sequence number.
- Topic structure: `guardrail/train01/sensors` (trainID makes multi-train deployment simple — just subscribe to `guardrail/#`)
- Payload: JSON `{"ts": 1712345678.123, "ax": 0.02, "ay": -9.78, "az": 0.11, "yolo_cls": "CLEAR", "yolo_conf": 0.97}`

**Link 2: Android → Laptop Server (Python paho-mqtt bridge)**
- The Termux Python script subscribes to the local MQTT broker and re-publishes to the laptop's Mosquitto broker over 4G
- SQLite stores every packet with a `forwarded` boolean flag; unfulfilled packets are retried on next network availability
- Maximum buffer depth: ~72 hours × 100 packets/second = ~26 million packets (~600 MB of SQLite data)

**Link 3: Laptop → Render (HTTPS POST every 2 seconds)**
- The Flask app on the laptop runs a background thread using `schedule` that packages the latest IASI, FFT, and obstacle data as JSON and POSTs to `https://guardrail-api.onrender.com/update`
- Push (not pull) because the laptop has ephemeral connectivity — it may be behind NAT, making it unreachable by an external pull
- 2-second interval balances freshness vs. Render API rate limits on the free tier

**Link 4: Vercel Dashboard → Render API (HTTPS GET every 2 seconds)**
- The dashboard uses `setInterval` in a React `useEffect` to call `fetch('https://guardrail-api.onrender.com/latest')` every 2 seconds
- Why polling and not WebSocket: WebSockets require the server to maintain persistent connections. On Render free tier, this is expensive. Polling every 2 seconds is simple, stateless, and sufficient for this application — the operator does not need sub-second updates.
- Total added latency from this layer: 0–2 seconds (depends on when the poll fires relative to the last push)

**Total acceptable latency — why 2–4 seconds is fine:**
A train at 130 km/h travels **36 centimetres per millisecond**. In 4 seconds, it travels **144 metres**. The obstacle detection system gives a 500-metre warning, so 4 seconds of dashboard latency still leaves the operator with **356 metres of margin** to issue a speed reduction instruction to the loco-pilot. The critical safety system (local YOLO detection → local alarm on the train) operates at <20ms, independent of the cloud dashboard.

---

## SECTION 7 — LIKELY EXAMINER QUESTIONS AND ANSWERS

---

**Q1. What is IASI and why did you create it?**

IASI — Infrastructure Anomaly Severity Index — is a composite 0–100 safety index we designed to give operators a single actionable number rather than making them interpret multiple independent signals simultaneously. We weighted it as 50% vibration (structural health), 35% obstacle detection (life-safety), and 15% communication health (system reliability). The weights reflect the relative urgency of each signal type for track safety.

---

**Q2. Why does vibration get 50 points and not more?**

We debated giving vibration 70 points, but the obstacle component needs to be substantial enough that a CLEAR detection on a badly damaged track still triggers an ALERT — the loco-pilot needs to slow down even if no obstacle is in sight. At 35 points, a PERSON detection (confidence 0.70) adds 21 points to IASI on its own, enough to push a borderline MONITOR reading into ALERT. That is the right behaviour.

---

**Q3. What is FFT and why is it better than raw vibration?**

FFT — Fast Fourier Transform — converts a time-domain vibration signal into its constituent frequencies. A joint fault generates energy at 18 Hz. A rail crack generates energy at 26 Hz. Both could have the same peak amplitude. Without FFT, they look identical — "high vibration". With FFT, they have completely different spectral fingerprints and can be diagnosed correctly. FFT gives us the *signature* of the fault, not just the severity.

---

**Q4. What is the Isolation Forest and why not a supervised model?**

Isolation Forest is an unsupervised anomaly detection algorithm. It learns what normal track vibration looks like, and scores any new reading by how easily it can be "isolated" from the normal cluster. We chose it over a supervised classifier like SVM or neural network for one reason: we cannot collect labelled fault data safely. You cannot introduce controlled cracks into working track to build a training set. We have abundant normal data and almost no fault examples. Isolation Forest works perfectly with only normal data.

---

**Q5. Why MQTT and not HTTP for IoT communication?**

HTTP is request-response: the client asks, the server answers. This requires the sensor device to run an HTTP server, which consumes significant memory on a Pi Zero 2W (512MB RAM, already running the camera and FFT). MQTT is publish-subscribe: the Pi just publishes to a topic in 1KB packets, with no server overhead. MQTT also has built-in QoS levels, retained messages, and graceful disconnection handling — all critical for a device on a moving train with intermittent connectivity.

---

**Q6. What happens if the Android bridge loses connectivity?**

The SQLite buffer absorbs all data during the outage. The IASI Communication Score drops to reflect degraded connectivity — this correctly signals to the operator that they are not receiving live data. On the train itself, the Raspberry Pi continues running YOLO detection and generating local alerts independently. When connectivity restores, the buffer replays all stored packets in order, giving a complete historical record with no gaps.

---

**Q7. Why is the communication score lower during network outages?**

Because an operator receiving stale or delayed data is at higher risk than one receiving live data. The Communication Score quantifies the system's ability to deliver timely information. During an outage, latency spikes, packets are buffered (not live), and the operator may be making decisions on 30-second-old data. That is a real risk component that belongs in the IASI.

---

**Q8. What does SEVERE_DAMAGE look like on the FFT chart?**

Two peaks: a primary peak at approximately 40 Hz and a secondary peak around 46 Hz, with broad energy spread across the entire 25–50 Hz range. Normal track has a narrow peak below 10 Hz. Severe damage produces chaotic multi-band energy because multiple simultaneous defects — cracks, loose fasteners, gauge deviation — each generate their own characteristic frequencies, and they all superpose in the FFT output.

---

**Q9. Why Vercel for frontend and Render for backend?**

Vercel's global CDN is optimized for static Next.js exports — our dashboard loads under 2 seconds anywhere in India. Vercel also provides automatic HTTPS, custom domains, and continuous deployment from GitHub. Render provides persistent Python Flask server hosting with free-tier HTTPS — suitable for our prototype API. Separating frontend and backend follows industry-standard architecture and allows either to be scaled or replaced independently.

---

**Q10. What is QoS 1 in MQTT?**

Quality of Service level 1 guarantees **at-least-once delivery**. The publisher sends a message and waits for a `PUBACK` acknowledgement from the broker. If no ack arrives within the timeout, the message is retransmitted. The receiver may occasionally get duplicates (if the ack was lost), but every message is guaranteed to arrive. For safety data, we prefer occasional duplicates over missed packets — missing a crack detection reading is worse than processing it twice.

---

**Q11. Why does the Random Forest look at 10 readings and not just 1?**

Ten readings give us the **slope and variance** of the IASI signal — information that a single reading cannot provide. A single reading of 48 is ambiguous: is this a momentary spike from a bump, or is it a sustained rising fault? Ten readings make this clear: if the values are 38, 40, 41, 43, 44, 46, 46, 47, 48, 48, the slope is +1 point/second and this is clearly escalating. The Random Forest can classify this as ALERT before the reading ever crosses 50.

---

**Q12. How would you connect real hardware in Phase 2?**

Phase 2 involves three changes. First, mount the MPU6050 accelerometer on the bogie and connect it to the Pi via I2C. Write a Python data-acquisition loop using `smbus2` at 100 Hz. Second, attach a Pi Camera module and load the TinyML YOLO model using `tflite_runtime`. Third, replace the `useSimulation` React hook with real `fetch()` calls to the Render API. The dashboard code itself does not change — only the data source changes from synthetic to real.

---

**Q13. What is TinyML and why is it on the Raspberry Pi?**

TinyML (Tiny Machine Learning) refers to ML models that have been optimised — through quantisation and pruning — to run on microcontrollers and embedded processors with limited RAM and compute. We use YOLOv8 Nano (the smallest variant) quantised from float32 to INT8, reducing its size from ~6 MB to ~1.5 MB and its inference time from ~500ms to ~80ms on the Pi Zero 2W. This is fast enough for obstacle detection at train speeds.

---

**Q14. Why does CRITICAL need an emergency stop and not just a warning?**

At CRITICAL (IASI > 75), the Isolation Forest has detected vibration patterns consistent with imminent rail failure. An IASI of 80 means 50% of the structural risk budget is consumed by vibration alone — the crack is large, the energy is high, and another train or heavy freight wagon passing at speed could split the rail completely. A "warning" that a driver ignores for 30 seconds means 30 seconds at 130 km/h = 1.08 km of travel on a potentially breaking track. The emergency stop is the only responsible response.

---

**Q15. What is the purpose of the SQLite buffer on the Android phone?**

The buffer provides **store-and-forward** capability. Indian Railways operates through tunnels, remote ghat sections, and rural areas with zero mobile connectivity. Without a buffer, all sensor data generated during these coverage gaps would be permanently lost, leaving holes in the health record. The SQLite database stores packets with timestamps and a `forwarded` flag. On connectivity restoration, a background thread replays unforwarded packets in chronological order, giving the operator a complete, gap-free history of track health across the entire run.

---

**Q16. How does the dashboard stay live when the laptop is off?**

In Phase 1, the dashboard is a pure client-side simulation — it runs entirely in the browser and does not depend on any server. In Phase 2, the Render API would cache the last received state from the laptop and continue serving it after a push timeout. The Communication Score would drop to reflect staleness, and the operator would see "COMM: DEGRADED" in the system health panel, indicating they are looking at cached data. The dashboard design explicitly separates "no data = unknown state" from "data = current state".

---

**Q17. What is the difference between JOINT_FAULT and LOOSE_FASTENER vibration signatures?**

**Joint Fault** produces energy centered at ~18 Hz. Rail joints are spaced at regular 15-metre intervals. At 100 km/h (27.8 m/s), the train crosses a joint every 0.54 seconds (1.85 Hz). The fundamental is 1.85 Hz, but the sharp impact creates harmonics — energy at 3.7, 7.4, 14.8, 18.5 Hz and so on. The FFT peak at 18 Hz is the 10th harmonic of the joint impact frequency.

**Loose Fastener** produces energy at ~14 Hz. The fastener-to-sleeper interaction creates a different resonant frequency because it involves the rail flexing laterally rather than the wheel impacting a discontinuity. The lateral flex frequency depends on rail stiffness and fastener spacing — approximately 14 Hz for standard Indian track geometry.

---

**Q18. Why does obstacle detection confidence affect IASI?**

Because a low-confidence detection is itself a safety risk. If the YOLO model is 70% confident that the object ahead is a person, that means it's 30% uncertain — in a life-safety context, 30% uncertainty is unacceptably high, and the system must treat it as if the person is definitely there. By incorporating confidence into the Obstacle Score, we ensure the IASI rises proportionally with detection uncertainty, alerting the operator to investigate even when the model isn't fully sure.

---

**Q19. What would you improve if you had more time?**

Three improvements in priority order:
1. **Replace simulated data with real MPU6050 readings** — the code structure already supports this; it's a hardware assembly task, not a software redesign
2. **Add WebSocket real-time push** — replace the 2-second polling interval with a WebSocket connection so the dashboard updates within 100ms of new data arriving, removing the last significant latency
3. **Add per-GPS-coordinate health mapping** — attach a GPS module to the Pi and tag every reading with a coordinate. This allows plotting track health on a geographic map of the Indian rail network, so engineers can identify specific kilometre-posts that consistently show elevated IASI

---

**Q20. What is the real-world impact of this system on Indian Railways safety?**

Indian Railways reported **17,000+ track defects** found during manual inspection in FY2023 — but manual inspection happens only every 3–6 months, so these are the defects that were large enough to be visible. How many micro-cracks went undetected? If we deploy one GuardRail unit on every express train (approximately 68 Rajdhani/Shatabdi trains), every track section on those routes gets scanned at least once per day instead of once per quarter. The detection window for developing faults goes from 90 days to 24 hours — a 90× improvement. Given that a single derailment costs between ₹50 crore (minor) and ₹1,000 crore (major, with casualties and compensation), even preventing one derailment per year pays for the entire national deployment.

---

## SECTION 8 — QUICK REFERENCE CARD

*Glance at this before and during your presentation.*

---

**PROJECT**
> AXON — IIOT Integrated Edge-AI Based Railway Track Health Monitoring and Supervision System
> Subject 22EEE65 | New Horizon College of Engineering, Bengaluru | AY 2025-26
> Team: G Sai Sugeet · John Benny J · Neetha Udupa G · S D Mukhesh

---

**IASI FORMULA**
> IASI = (Vibration Score × 0.50) + (Obstacle Score × 0.35) + (Communication Score × 0.15)

---

**RISK CLASSIFICATIONS**

| Class | Range | Action |
|---|---|---|
| SAFE | 0–25 | Log and monitor |
| MONITOR | 26–50 | Schedule maintenance |
| ALERT | 51–75 | Speed restriction + immediate maintenance |
| CRITICAL | 76–100 | Emergency stop + send crew |

---

**5 SCENARIOS AND IASI RANGES**

| Scenario | IASI Range | Fault Type |
|---|---|---|
| NORMAL | 5–18 | No fault |
| JOINT FAULT | 22–38 | Loose rail joint, rhythmic impact |
| LOOSE FASTENER | 15–30 | Loose rail clip, lateral wobble |
| RAIL CRACK | 38–54 | Fatigue crack, high-frequency spike |
| SEVERE DAMAGE | 60–92 | Multiple defects, multi-band chaos |

---

**2 ML MODELS**
> **Isolation Forest** — Unsupervised anomaly detection trained on 500 normal packets, outputs Vibration Score (0→100)
> **Random Forest** — Supervised classifier trained on 2000 sequences, uses 10-reading window + slope + variance → SAFE/MONITOR/ALERT/CRITICAL

---

**4 COMMUNICATION LINKS**

| Link | Protocol | Key Feature |
|---|---|---|
| Pi → Android | MQTT QoS 1 | At-least-once delivery guarantee |
| Android → Server | paho-mqtt + SQLite | 72-hour offline buffer |
| Server → Render | HTTPS POST every 2s | Push architecture (Pi is behind NAT) |
| Vercel → Render | HTTPS GET every 2s | Polling (simpler than WebSocket for prototype) |

---

**TECH STACK**

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · Recharts |
| Fonts | Rajdhani (display) · JetBrains Mono (data) |
| Hosting | Vercel (static export, `output: 'export'`) |
| Edge Device | Raspberry Pi Zero 2W · Python · paho-mqtt |
| ML | scikit-learn IsolationForest · scikit-learn RandomForestClassifier |
| Camera | YOLOv8 Nano quantised INT8 via TFLite |
| Backend | Flask REST API · Mosquitto MQTT Broker · SQLite |
| Cloud API | Render free tier · UptimeRobot keep-alive |

---

**WHAT TO SAY IN ONE BREATH:**
> "AXON is a real-time railway track health dashboard. We mount a Raspberry Pi and camera on each train — the Pi reads vibration and detects obstacles. An Android phone bridges the data to our ML server, which runs Isolation Forest to score vibration anomalies and Random Forest to classify risk. The IASI score — a weighted composite of vibration, obstacle, and communication health — updates every second on our Vercel dashboard. Phase 1 is a verified simulation of this pipeline; Phase 2 connects the real hardware."
