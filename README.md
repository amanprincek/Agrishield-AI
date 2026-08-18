# 🌾 AgriShield-AI

AgriShield-AI is a Smart Agriculture platform being developed for the **Smart India Hackathon (SIH)**.

The goal of the project is to help farmers monitor their fields, manage agricultural data, detect crop-related problems using AI, and receive useful alerts and recommendations.

The project is currently under active development.

---

# 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Current Project Status](#-current-project-status)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Clone the Repository](#-clone-the-repository)
7. [Backend Setup](#-backend-setup)
8. [MySQL Database Setup](#-mysql-database-setup)
9. [Environment Variables](#-environment-variables)
10. [Running the Backend](#-running-the-backend)
11. [Running the Frontend](#-running-the-frontend)
12. [Testing the Application](#-testing-the-application)
13. [API Endpoints](#-api-endpoints)
14. [Database](#-database)
15. [Frontend Field Management](#-frontend-field-management)
16. [Git and GitHub Workflow](#-git-and-github-workflow)
17. [Creating a New Feature Branch](#-creating-a-new-feature-branch)
18. [Commit and Push](#-commit-and-push)
19. [Pull Request Workflow](#-pull-request-workflow)
20. [Keeping Local Main Updated](#-keeping-local-main-updated)
21. [Important Git Commands](#-important-git-commands)
22. [Development Rules](#-development-rules)
23. [Troubleshooting](#-troubleshooting)
24. [Future Modules](#-future-modules)

---

# 🌱 Project Overview

AgriShield-AI is being developed as an intelligent agriculture assistance platform.

The platform is intended to provide features such as:

- 🌾 Farmer and field management
- 🌱 Crop information management
- 🤖 AI-based crop/disease detection
- 🚨 Agricultural alerts
- 🌦️ Weather-related information
- 📊 Agricultural dashboard
- 💾 Structured database storage
- 🔮 Future AI-based recommendations

The current development focus is on establishing a strong backend, database and frontend foundation before implementing advanced AI modules.

---

# 🚧 Current Project Status

## Completed

### Git/GitHub

- Git repository established
- `main` branch established
- Feature-based Git workflow established
- Backend foundation branch completed
- Database foundation completed
- Field management branch completed
- Frontend foundation branch completed
- Pull Request based merging workflow established

### Backend

- FastAPI backend created
- Uvicorn development server configured
- MySQL connection implemented
- Environment variables configured using `.env`
- Field management APIs implemented
- CRUD operations implemented

### Database

- MySQL installed and configured
- Database connection tested
- `fields` table implemented
- Backend successfully connected to MySQL

### Frontend

- React + Vite frontend created
- Dashboard UI created
- Field management UI implemented
- Add Field implemented
- View Fields implemented
- Edit Field implemented
- Delete Field implemented
- Frontend connected to FastAPI backend
- Frontend connected indirectly to MySQL through backend

---

# 🛠 Technology Stack

## Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- npm

## Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

## Database

- MySQL 8.x
- MySQL Connector/Python

## Development Tools

- Git
- GitHub
- Visual Studio Code
- PowerShell

---

# 📁 Project Structure

Current project structure:

```text
Agrishield-AI/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md



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


### At last i want to say that it will not harm at last so please everybody start to contribute


**Predict Early. Act Early. Protect Agriculture.**
