from typing import Dict, Any, List
from backend.data_sources import get_weather, get_ndvi, get_iot_data
from backend.model import risk_model

def get_risk_level_info(score: int) -> Dict[str, str]:
    """
    Maps 0-100 Crop Risk Score to Risk Level and Color.
    0–25   -> GREEN  (Low Risk)
    26–50  -> YELLOW (Watch)
    51–75  -> ORANGE (Moderate Risk)
    76–100 -> RED    (High Risk)
    """
    if score <= 25:
        return {
            "level": "GREEN",
            "label": "Low Risk",
            "description": "Field conditions are optimal. Low pest and stress vulnerability."
        }
    elif score <= 50:
        return {
            "level": "YELLOW",
            "label": "Watch",
            "description": "Mild environmental fluctuations detected. Routine inspection suggested."
        }
    elif score <= 75:
        return {
            "level": "ORANGE",
            "label": "Moderate Risk",
            "description": "Suboptimal microclimate (e.g. humidity/soil stress). Preventive action recommended."
        }
    else:
        return {
            "level": "RED",
            "label": "High Risk",
            "description": "Critical stress or disease-favorable indicators. Immediate intervention required."
        }

def generate_recommendations(score: int, weather: Dict[str, Any], ndvi: float, iot: Dict[str, Any]) -> List[str]:
    """
    Rule-based agronomic recommendations.
    Deterministic, explainable, and clear without LLM hallucination.
    """
    recs = []
    
    if score <= 25:
        recs.append("Maintain current irrigation schedule.")
        recs.append("Continue regular crop monitoring.")
        recs.append("Inspect crop canopy during next routine field visit.")
    elif score <= 50:
        recs.append("Monitor field conditions more frequently over the next 48 hours.")
        if weather.get("humidity", 0) > 70 or iot.get("humidity", 0) > 70:
            recs.append("Watch for early signs of fungal spore development due to elevated humidity.")
        if iot.get("soil_moisture", 40) < 30:
            recs.append("Consider a light irrigation cycle to replenish root-zone soil moisture.")
        else:
            recs.append("Check soil moisture balance and drainage.")
        recs.append("Inspect underside of lower leaves for early pest activity.")
    elif score <= 75:
        recs.append("Schedule an on-site field inspection within 24 hours.")
        if weather.get("humidity", 0) > 75:
            recs.append("High humidity detected: apply bio-fungicide or neem oil as a preventive shield.")
        if iot.get("soil_moisture", 40) < 25:
            recs.append("Immediate irrigation needed to prevent moisture deficit stress.")
        elif iot.get("soil_moisture", 40) > 55:
            recs.append("Check drainage channels to prevent root-zone waterlogging.")
        recs.append("Check for visible leaf spotting, discoloration, or rust symptoms.")
    else: # RED
        recs.append("Inspect affected crop zones immediately.")
        recs.append("Conduct a full leaf and stem examination for visible pathogen or pest symptoms.")
        recs.append("Isolate and treat high-risk patches with targeted crop protection measures.")
        recs.append("Check soil moisture and microclimate balance immediately.")
        recs.append("Consider consulting a local agricultural extension officer or Krishi Vigyan Kendra (KVK).")
        
    return recs

def analyze_field(field_id: int, field_name: str, crop: str, latitude: float, longitude: float) -> Dict[str, Any]:
    """
    End-to-End Prediction Pipeline:
    1. Fetches weather data (Open-Meteo or fallback).
    2. Fetches NDVI data.
    3. Fetches IoT telemetry (ESP32 or simulated).
    4. Constructs feature vector.
    5. Predicts Crop Risk Score via XGBoost model.
    6. Formulates risk classification and preventive measures.
    """
    # 1. Weather
    weather_data, weather_src = get_weather(latitude, longitude)
    
    # 2. NDVI
    ndvi_val, ndvi_src = get_ndvi(latitude, longitude)
    
    # 3. IoT
    iot_data, iot_src = get_iot_data(field_id)
    
    # Blend/Prefer IoT for localized microclimate if available
    temp = iot_data.get("temperature", weather_data.get("temperature", 28.0))
    humidity = iot_data.get("humidity", weather_data.get("humidity", 65.0))
    rainfall = weather_data.get("rainfall", 0.0)
    soil_moisture = iot_data.get("soil_moisture", weather_data.get("soil_moisture", 38.0))
    
    # 4 & 5. Model Risk Prediction
    risk_score = risk_model.predict_risk_score(
        ndvi=ndvi_val,
        temperature=temp,
        humidity=humidity,
        rainfall=rainfall,
        soil_moisture=soil_moisture
    )
    
    # 6. Risk Level
    risk_info = get_risk_level_info(risk_score)
    
    # 7. Recommendations
    recommendations = generate_recommendations(risk_score, weather_data, ndvi_val, iot_data)
    
    return {
        "field_id": field_id,
        "field_name": field_name,
        "crop": crop,
        "risk_score": risk_score,
        "risk_level": risk_info["level"],
        "risk_label": risk_info["label"],
        "risk_description": risk_info["description"],
        "data_sources": {
            "weather": weather_src,
            "ndvi": ndvi_src,
            "iot": iot_src
        },
        "environmental_snapshot": {
            "temperature": temp,
            "humidity": humidity,
            "rainfall": rainfall,
            "soil_moisture": soil_moisture,
            "soil_temperature": weather_data.get("soil_temperature", 24.0),
            "ndvi": ndvi_val
        },
        "recommendations": recommendations
    }
