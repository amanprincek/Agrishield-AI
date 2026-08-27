# 🌾 AgriShield-AI

> **Smart India Hackathon (SIH) Prototype — AI-Powered Agricultural Field Risk Monitoring**

AgriShield-AI is a smart agriculture prototype designed to help farmers monitor field conditions and identify potential crop-risk situations using environmental data, geospatial information, IoT telemetry, and a machine-learning risk model.

The current prototype demonstrates a complete **Field Registration → Data Collection → AI Analysis → Risk Score** workflow through a React frontend and FastAPI backend.

---

## 🚀 What AgriShield-AI Does

A farmer can:

- Register an agricultural field
- Store crop, area, location, latitude and longitude
- View all registered fields
- Edit field information
- Delete fields
- Analyze a field using environmental parameters
- Receive a crop-risk score from **0–100**
- Send ESP32/IoT sensor telemetry to the backend
- Use live weather data from **Open-Meteo** when available

The prototype is intentionally modular so that demo providers can later be replaced with production-grade satellite, IoT and agricultural datasets.

---

## 🧠 Core Architecture

```text
                    ┌─────────────────────┐
                    │     React Frontend  │
                    │      + Vite         │
                    └──────────┬──────────┘
                               │
                         REST API / JSON
                               │
                               ▼
                    ┌─────────────────────┐
                    │     FastAPI         │
                    │   Backend / API     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼─────────────────┐
              │                │                 │
              ▼                ▼                 ▼
        ┌───────────┐   ┌─────────────┐   ┌─────────────┐
        │   MySQL   │   │ Data Sources│   │ ML Pipeline │
        │ + SQLAlch.│   │             │   │             │
        └───────────┘   └──────┬──────┘   └──────┬──────┘
                               │                 │
                     ┌─────────┼─────────┐       │
                     ▼         ▼         ▼       ▼
                 Open-Meteo   NDVI      IoT   Risk Model
                  (live*)    (demo)   (ESP32) Gradient Boosting
```

`*` Open-Meteo is live when the API request succeeds; the prototype has a deterministic fallback if the request fails.

---

## 🛠️ Tech Stack

### Frontend

- React 19
- Vite
- JavaScript / JSX
- Lucide React
- REST API integration

### Backend

- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- PyMySQL
- Requests
- NumPy
- scikit-learn
- XGBoost (attempted first, with runtime fallback)

### Database

- MySQL

### External Data

- Open-Meteo Weather API

### IoT

- ESP32-compatible HTTP/JSON telemetry endpoint

### Machine Learning

- Gradient Boosting Regressor — current active model in the tested environment
- XGBoost — initial model path, with fallback handling

---

## 📂 Project Structure

```text
Agrishield-AI/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── model.py
│   ├── prediction.py
│   └── data_sources.py
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
├── README.md
└── .env
```

---

# 🔄 Complete Application Flow

## 1. Field Registration

The farmer enters:

- Farmer name
- Field name
- Location
- Latitude
- Longitude
- Crop
- Area in acres

The React frontend sends:

```http
POST /api/fields
```

Example JSON:

```json
{
  "farmer_name": "Aman Kumar",
  "name": "Allahabad",
  "location": "Kanpur, Uttar Pradesh",
  "latitude": 26.4499,
  "longitude": 80.3319,
  "crop": "Wheat",
  "area_acres": 5
}
```

FastAPI validates the request using Pydantic.

SQLAlchemy then creates the database record in MySQL.

---

## 2. Field Storage

The main database table is:

```text
fields
```

Important columns:

| Column | Purpose |
|---|---|
| `id` | Primary key / unique field ID |
| `farmer_name` | Farmer name |
| `name` | Field name |
| `location` | Human-readable location |
| `latitude` | GPS latitude |
| `longitude` | GPS longitude |
| `crop` | Cultivated crop |
| `area_acres` | Field area |
| `created_at` | Record creation time |

The `id` column is an `AUTO_INCREMENT` primary key.

> **Current schema note:** The `fields` table has a primary key but does not currently define a foreign key.

---

# 🌦️ Environmental Data

## Open-Meteo Weather

The backend uses the field's:

```text
latitude
longitude
```

to request current environmental data from Open-Meteo.

The current provider requests:

- Temperature
- Relative humidity
- Precipitation
- Soil temperature
- Soil moisture

The backend then normalizes the response for the prediction pipeline.

### Important

Open-Meteo is **actually integrated** into the current prototype.

However, the implementation contains a fallback:

```text
Open-Meteo request
       │
       ├── Success → live data
       │
       └── Failure → deterministic demo data
```

Therefore:

> **Weather = Live when API succeeds, demo fallback when it does not.**

The current `rainfall` value comes from Open-Meteo's current precipitation field and should not be described as long-term accumulated rainfall.

---

# 🛰️ NDVI Status

NDVI is one of the five features used by the risk model.

However, the current NDVI provider is **demo/simulated**.

The current implementation generates a deterministic NDVI value from latitude and longitude and explicitly identifies its source as:

```text
ndvi_source = "demo"
```

Therefore, the current prototype should **not** claim that it is already receiving satellite-derived NDVI.

### Future upgrade

The NDVI provider can later be replaced by a real satellite-data pipeline, for example using Sentinel/Landsat-derived vegetation indices.

The architecture is already separated through a provider function, so this can be added without redesigning the complete application.

---

# 📡 IoT / ESP32 Integration

The backend exposes:

```http
POST /api/iot/data
```

Expected JSON:

```json
{
  "field_id": 10,
  "temperature": 29.4,
  "humidity": 72,
  "soil_moisture": 41
}
```

The backend records the latest telemetry for the field.

Current prototype flow:

```text
ESP32 Sensors
     │
     ▼
Wi-Fi / Internet
     │
     ▼
HTTP POST + JSON
     │
     ▼
FastAPI /api/iot/data
     │
     ▼
In-memory telemetry store
```

### Current limitation

IoT telemetry is currently stored in an in-memory Python dictionary.

Therefore:

- It works during the running backend session.
- The latest data can be used by the application.
- Data is lost when the backend process restarts.

If no telemetry has been received for a field, the current provider returns deterministic simulated ESP32 values.

Therefore:

> **IoT endpoint = real ingestion path + demo fallback.**

---

# 🤖 AI Risk Prediction

The prediction pipeline uses five features:

```text
1. NDVI
2. Temperature
3. Humidity
4. Rainfall
5. Soil Moisture
```

Conceptually:

```text
Field ID
   │
   ▼
Load field from MySQL
   │
   ▼
Collect environmental inputs
   │
   ├── Weather
   ├── NDVI
   └── IoT
   │
   ▼
Feature Vector
[NDVI, Temperature, Humidity, Rainfall, Soil Moisture]
   │
   ▼
ML Risk Model
   │
   ▼
Risk Score 0–100
```

---

# 🌳 Why Gradient Boosting?

The prototype initially attempts to use XGBoost.

However, during testing in the Windows/Python environment, the XGBoost training path produced a native access violation.

Instead of allowing that issue to stop the entire application, the model implementation falls back to:

```text
GradientBoostingRegressor
```

The tested runtime confirmed:

```text
[ML Engine] Gradient Boosting Crop Risk Model trained successfully.

MODEL OK: gradient_boosting
```

So the **currently active model in the tested environment is Gradient Boosting**.

### Why Gradient Boosting?

Gradient Boosting is useful for tabular numerical data and can learn nonlinear relationships between variables.

It builds multiple decision trees sequentially.

Each new tree attempts to reduce the errors made by the existing ensemble.

Simplified:

```text
Initial prediction
      ↓
Tree 1
      ↓
Calculate errors
      ↓
Tree 2 learns from errors
      ↓
Calculate remaining errors
      ↓
Tree 3 improves prediction
      ↓
...
      ↓
Final risk prediction
```

---

# 📊 Training Data

The current model is trained using **synthetic agronomic data**.

The code generates approximately 500 samples using predefined environmental ranges and agronomic rules.

Examples of rules represented in the synthetic dataset:

- Low NDVI → higher vegetation stress
- High humidity + warm temperature → increased fungal/pest risk
- Low soil moisture + high temperature → drought/heat stress
- High soil moisture + high rainfall → waterlogging risk
- Healthy environmental conditions → reduced risk

This is useful for demonstrating the complete ML pipeline.

However:

> The current prototype does not use a real labeled agricultural disease dataset for model training.

Therefore, real-world model accuracy should **not** be claimed yet.

---

# 🎯 Understanding the Risk Score

The model produces a score from:

```text
0 → 100
```

Current interpretation:

```text
Lower score = healthier conditions
Higher score = greater attention required
```

For example:

```text
9 / 100 → Low risk / healthy conditions
```

This does **not** mean:

```text
9% probability of disease
```

The score is a prototype risk score, not a calibrated disease probability.

---

# 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health check |
| GET | `/api/fields` | Get all fields |
| GET | `/api/fields/{field_id}` | Get one field |
| POST | `/api/fields` | Register a field |
| PUT | `/api/fields/{field_id}` | Update a field |
| DELETE | `/api/fields/{field_id}` | Delete a field |
| POST | `/api/prediction/{field_id}` | Analyze field risk |
| POST | `/api/iot/data` | Receive ESP32 telemetry |

Swagger/OpenAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

Health endpoint:

```text
http://127.0.0.1:8000/api/health
```

---

# ⚙️ Local Setup

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Agrishield-AI
```

---

## 2. Create Python virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
```

Activate:

```powershell
.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, use an appropriate local execution-policy adjustment or activate the environment through another terminal.

---

## 3. Install backend dependencies

```powershell
python -m pip install -r requirements.txt
```

Verify:

```powershell
python -m pip show fastapi uvicorn pydantic sqlalchemy PyMySQL python-dotenv requests numpy scikit-learn xgboost
```

---

## 4. Configure environment variables

Create a `.env` file in the project root.

Example structure:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=YOUR_PASSWORD
DATABASE_NAME=agrishield_db
```

> Do not commit real passwords, API keys or secrets to GitHub.

---

# 🗄️ Database Setup

Create the MySQL database first:

```sql
CREATE DATABASE agrishield_db;
```

Then execute the project schema using MySQL.

The schema creates the `fields` table required by the backend.

On Windows PowerShell, avoid using Linux-style `< database/schema.sql` redirection.

Use:

```powershell
Get-Content database/schema.sql | mysql -u root -p
```

Verify:

```powershell
mysql -u root -p -e "USE agrishield_db; DESCRIBE fields;"
```

---

# ▶️ Run Backend

From the project root:

```powershell
uvicorn backend.main:app --reload
```

Expected:

```text
Uvicorn running on http://127.0.0.1:8000
Application startup complete.
```

You can also use:

```powershell
python -m uvicorn backend.main:app --reload
```

---

# ▶️ Run Frontend

Open a second terminal.

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server runs on the configured frontend port.

The frontend uses:

```text
/api
```

for backend requests and Vite proxies them to:

```text
http://127.0.0.1:8000
```

---

# 🧪 Verification

### Check backend import

```powershell
python -c "import backend.main; print('APP OK:', hasattr(backend.main, 'app'))"
```

### Check ML model

```powershell
python -c "from backend.model import risk_model; print('MODEL:', risk_model.model_type); print('TEST:', risk_model.predict_risk_score(0.75,25,60,2,40))"
```

### Check API

Open:

```text
http://127.0.0.1:8000/api/health
```

or:

```text
http://127.0.0.1:8000/docs
```

---

# 🔐 Current Prototype vs Production

| Feature | Current Prototype | Production Goal |
|---|---|---|
| Field storage | MySQL | MySQL/PostgreSQL |
| Weather | Open-Meteo + fallback | Reliable live weather provider |
| NDVI | Demo | Real satellite-derived NDVI |
| IoT | HTTP JSON + in-memory store | Persistent telemetry database |
| ML data | Synthetic | Real labeled agricultural dataset |
| ML model | Gradient Boosting fallback | Validated crop-specific models |
| Authentication | Not implemented | Farmer/admin authentication |
| CORS | Permissive prototype config | Restricted frontend origin |
| HTTPS | Local development | Required in production |
| Monitoring | Basic logs | Structured logging + monitoring |
| Model evaluation | Not scientifically validated | Accuracy/F1/MAE + field validation |
| Secrets | `.env` | Secure secret manager |

---

# ⚠️ Important Prototype Limitations

AgriShield-AI is currently a **working technical prototype**, not a production agricultural diagnosis system.

The most important limitations are:

1. NDVI is currently demo data.
2. ML training data is synthetic.
3. IoT telemetry is currently stored in memory.
4. The active model is Gradient Boosting in the tested environment, not XGBoost.
5. The risk score is not a calibrated disease probability.
6. Real-world agricultural validation has not yet been performed.

These limitations are intentional prototype boundaries and define the next stage of development.

---

# 🔮 Future Roadmap

### Phase 1 — Current Prototype

- [x] React frontend
- [x] FastAPI backend
- [x] MySQL database
- [x] Field CRUD
- [x] GPS coordinates
- [x] Open-Meteo integration
- [x] IoT JSON endpoint
- [x] ML risk scoring
- [x] Demo fallback system

### Phase 2 — Real Data

- [ ] Real satellite NDVI
- [ ] Persistent ESP32 telemetry
- [ ] Historical environmental data
- [ ] Crop-specific datasets
- [ ] Real disease labels

### Phase 3 — Production AI

- [ ] Model validation
- [ ] Model versioning
- [ ] Crop-specific risk models
- [ ] Disease classification
- [ ] Early-warning alerts
- [ ] Confidence/calibration metrics

### Phase 4 — Smart Agriculture Platform

- [ ] Farmer authentication
- [ ] Mobile/PWA support
- [ ] Historical field analytics
- [ ] Satellite map layers
- [ ] Automated alerts
- [ ] Advisory recommendations
- [ ] Scalable cloud deployment

---

# 🏆 SIH Presentation — Technical Positioning

A concise and technically accurate explanation of the prototype is:

> **"AgriShield-AI is a modular agricultural field-risk monitoring platform. The farmer registers a field with GPS coordinates, the backend stores the field in MySQL, environmental providers supply weather/IoT/NDVI features, and a machine-learning model converts those five environmental features into a 0–100 crop-risk score. In the current prototype, Open-Meteo is live when available, while NDVI and missing IoT telemetry use demo providers. Our ML pipeline attempts XGBoost but currently runs Gradient Boosting successfully in the tested environment. The next step is replacing synthetic/demo components with validated satellite and field datasets."**

---

# 👥 Team

**Team Neural Ninja**

Built for the **Smart India Hackathon (SIH)** agricultural innovation challenge.

---

# 📌 Project Status

**Current status: Working Prototype ✅**

The following workflow has been tested successfully:

```text
Register Field
      ↓
MySQL Storage
      ↓
Field Card
      ↓
Analyze Field
      ↓
Environmental Data
      ↓
ML Risk Model
      ↓
Risk Score
```

Example verified backend activity includes successful:

```text
GET  /api/fields          → 200 OK
POST /api/fields          → 201 Created
POST /api/prediction/{id} → 200 OK
DELETE /api/fields/{id}   → 200 OK
```

---

## 📄 License

This project is currently developed as a Smart India Hackathon prototype.

Add an appropriate open-source license before publicly distributing the repository as an open-source project.
