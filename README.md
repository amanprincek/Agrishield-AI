# 🌾 AgriShield AI

### Multimodal Early Disease & Pest Risk Forecast Platform

> **Predict early. Act early. Protect crops. 🌱**

AgriShield AI is an AI-powered agricultural early-warning platform designed to help farmers and agricultural officers identify **increasing disease and pest risk before major crop damage occurs**.

Instead of waiting for visible symptoms, AgriShield AI combines multiple sources of agricultural information — **weather conditions, satellite-derived crop health indicators, and field-level IoT data** — to estimate disease and pest risk and provide actionable early warnings.

---

## 🎯 The Problem

Crop diseases and pest attacks are often identified only after visible symptoms appear.

By that time:

* 🌱 Crop damage may already have started
* 💰 Farmers may face economic losses
* 🧪 Excessive pesticide use may occur
* 👨‍🌾 Early intervention becomes more difficult
* 🏞️ Agricultural officers cannot manually inspect every field

AgriShield AI aims to move agriculture from **late detection to early warning**.

---

## 💡 Our Solution

AgriShield AI combines multiple data sources:

```text
        🌦️ Weather Data
              +
        🛰️ Satellite Data
              +
        🌡️ IoT Field Data
              ↓
        Data Processing
              ↓
        🧠 Risk Engine
              ↓
     Disease / Pest Risk
              ↓
      ⚠️ Early Warning
              ↓
   ┌──────────┴──────────┐
   ↓                     ↓
👨‍🌾 Farmer            🧑‍💼 Officer
Dashboard              Dashboard
```

The system estimates risk as:

🟢 **Low Risk**

🟡 **Moderate Risk**

🔴 **High Risk**

and provides recommendations for timely field inspection and preventive action.

---

## 🚀 Key Features

### 🌡️ IoT Field Monitoring

Monitor field-level environmental conditions such as:

* Temperature
* Humidity
* Soil Moisture
* Leaf Wetness *(future hardware integration)*

The current prototype uses a **simulated IoT data layer**, which will later be replaced by real ESP32-based hardware.

### 🌦️ Weather Intelligence

Weather information can be used to identify environmental conditions that may favor disease and pest development.

### 🛰️ Satellite-Based Crop Health

Satellite-derived vegetation indicators such as:

* NDVI
* EVI

can help identify changes in crop health and vegetation stress.

### 🧠 AI-Based Risk Prediction

The platform combines multiple factors to estimate:

* Disease risk
* Pest risk
* Risk level
* Contributing environmental factors

The initial prototype uses a transparent risk-scoring approach, with trained machine-learning models planned for later versions.

### 🗺️ Disease Risk Map

Agricultural officers can view risk across different areas:

```text
🟢 Low Risk
🟡 Moderate Risk
🔴 High Risk
```

This can help prioritize field inspections.

### 🔔 Early Alerts

Farmers can receive warnings when environmental and crop-health indicators suggest increasing risk.

### 📱 Farmer Dashboard

Designed to present complex agricultural information in a simple and actionable way.

---

# 🏗️ System Architecture

```text
                         AGRISHIELD AI
                              │
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
        🌦️ Weather       🛰️ Satellite       🌡️ IoT
           API             NDVI/EVI         Simulator
             │                │                │
             └────────────────┼────────────────┘
                              ↓
                       ⚙️ FastAPI Backend
                              │
                       Data Processing
                              │
                    🧠 Risk Prediction Engine
                              │
                    ┌─────────┴─────────┐
                    ↓                   ↓
              👨‍🌾 Farmer          🧑‍💼 Officer
               Dashboard             Dashboard
```

### Future Hardware Architecture

```text
🌱 Agricultural Field
        ↓
   Sensors
        ↓
      ESP32
        ↓
      Wi-Fi
        ↓
    FastAPI Backend
        ↓
   Risk Prediction
```

The software is being designed so that the current simulated IoT layer can later be replaced with real ESP32 hardware without redesigning the complete system.

---

# 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI
* Uvicorn

### Database

* MySQL

### AI / Machine Learning

* Python
* NumPy
* Pandas
* Scikit-learn
* XGBoost *(planned)*

### IoT

* ESP32 *(future hardware)*
* BME280
* Soil Moisture Sensor
* Leaf Wetness Sensor *(optional)*

### GIS / Satellite

* Sentinel-2
* NDVI / EVI
* Leaflet
* OpenStreetMap
* Google Earth Engine *(planned)*

### External Data

* Weather APIs
* Satellite APIs / Earth observation services

---

# 📂 Project Structure

```text
AgriShield-AI/
│
├── frontend/          # React frontend
│
├── backend/           # FastAPI backend
│
├── ml/                # Machine learning & risk engine
│
├── iot/               # IoT simulator & future ESP32 integration
│
├── satellite/         # Satellite & NDVI/EVI processing
│
├── data/              # Datasets and sample data
│
├── docs/              # Documentation
│
└── README.md
```

---

# 🔄 Development Roadmap

### Phase 1 — Foundation

* [x] GitHub repository
* [x] Team collaboration setup
* [x] Python environment
* [x] FastAPI backend setup
* [ ] React frontend setup

### Phase 2 — Core Backend

* [ ] API architecture
* [ ] MySQL integration
* [ ] Field management
* [ ] Sensor data APIs
* [ ] Weather data APIs

### Phase 3 — IoT

* [ ] Simulated sensor data
* [ ] ESP32 integration
* [ ] Temperature monitoring
* [ ] Humidity monitoring
* [ ] Soil moisture monitoring

### Phase 4 — Satellite & GIS

* [ ] Satellite data integration
* [ ] NDVI calculation
* [ ] Crop-health visualization
* [ ] Interactive risk map

### Phase 5 — AI / Risk Engine

* [ ] Initial rule-based risk engine
* [ ] Dataset preparation
* [ ] ML model
* [ ] Disease risk prediction
* [ ] Pest risk prediction

### Phase 6 — User Applications

* [ ] Farmer dashboard
* [ ] Officer dashboard
* [ ] Alerts
* [ ] Recommendations
* [ ] Final system integration

### Phase 7 — Real-World Prototype

* [ ] Hardware deployment
* [ ] Field testing
* [ ] Model validation
* [ ] Performance evaluation

---

# 👨‍💻 Team AgriShield

### Team Members

| Member     | Role                              |
| ---------- | --------------------------------- |
| **Aman**   | IoT & Data Integration            |
| **Aditya** | AI / Machine Learning             |
| **Alice**  | Satellite / GIS                   |
| **Ajay**   | Backend Development               |
| **Ayushi** | Frontend Development              |
| **Aastha** | Agriculture Research & Validation |

> **Six minds. One mission. Smarter agriculture. 🌾**

---

# 🌱 Our Vision

We envision a future where farmers don't have to wait until crop diseases become visible before taking action.

AgriShield AI aims to transform agricultural monitoring from:

```text
Detect Damage
      ↓
React
```

to:

```text
Monitor
   ↓
Predict Risk
   ↓
Warn Early
   ↓
Act
   ↓
Protect Crops
```

---

# ⚠️ Current Prototype Status

AgriShield AI is currently under active development as a **Smart India Hackathon prototype**.

The initial software prototype uses simulated IoT data where physical hardware is not yet available.

Predictions in the early prototype should be treated as **risk estimates, not guaranteed disease diagnoses**.

Future versions will incorporate real sensor data, validated agricultural datasets, satellite observations, and trained machine-learning models.

---

## 🤝 Contributing

This project is currently being developed by the AgriShield AI team for Smart India Hackathon.

Team members should work through feature branches and merge completed work into the main branch after review.

---

## 📜 License

This project is currently intended for educational, research, and Smart India Hackathon development purposes.

---

### 🌾 AgriShield AI

**Predict Early. Act Early. Protect Agriculture.**
