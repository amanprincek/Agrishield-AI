import requests
import random
from typing import Dict, Any, Tuple

# In-memory store for ESP32 IoT telemetry sent via POST /api/iot/data
iot_telemetry_store: Dict[int, Dict[str, Any]] = {}

def get_weather(latitude: float, longitude: float) -> Tuple[Dict[str, Any], str]:
    """
    Fetches real-time environmental weather data from Open-Meteo API using field GPS coordinates.
    Gracefully falls back to deterministic demo data if internet or API is unreachable.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "soil_temperature_0cm",
            "soil_moisture_0_to_1cm"
        ],
        "timezone": "auto"
    }

    try:
        response = requests.get(url, params=params, timeout=4.0)
        if response.status_code == 200:
            data = response.json()
            current = data.get("current", {})
            
            temp = current.get("temperature_2m", 28.5)
            humidity = current.get("relative_humidity_2m", 65.0)
            rainfall = current.get("precipitation", 0.0)
            soil_temp = current.get("soil_temperature_0cm", temp - 2.0)
            # Open-meteo returns soil moisture in m³/m³ (e.g. 0.32 -> 32%)
            raw_sm = current.get("soil_moisture_0_to_1cm")
            soil_moisture = (raw_sm * 100.0) if raw_sm is not None else 38.0

            return {
                "temperature": round(float(temp), 1),
                "humidity": round(float(humidity), 1),
                "rainfall": round(float(rainfall), 1),
                "soil_temperature": round(float(soil_temp), 1),
                "soil_moisture": round(float(soil_moisture), 1)
            }, "live"
    except Exception as e:
        print(f"[Open-Meteo] Live fetch failed ({e}). Falling back to demo data.")

    # Deterministic demo fallback based on latitude/longitude hash
    seed = int(abs(latitude * 100 + longitude * 100)) % 100
    demo_weather = {
        "temperature": round(26.0 + (seed % 10), 1),
        "humidity": round(55.0 + (seed % 30), 1),
        "rainfall": round((seed % 5) * 0.8, 1),
        "soil_temperature": round(24.0 + (seed % 6), 1),
        "soil_moisture": round(35.0 + (seed % 25), 1)
    }
    return demo_weather, "demo"

def get_ndvi(latitude: float, longitude: float) -> Tuple[float, str]:
    """
    NDVI (Normalized Difference Vegetation Index) provider abstraction.
    Returns NDVI value (0.0 to 1.0) representing canopy greenness & chlorophyll vigor.
    Currently returns a deterministic demo value clearly tagged with ndvi_source = 'demo'.
    """
    # Deterministic calculation so repeated clicks on the same coordinates yield stable results
    lat_factor = abs(latitude * 13) % 1.0
    lon_factor = abs(longitude * 17) % 1.0
    # Healthy agricultural vegetation typically falls between 0.55 and 0.85
    base_ndvi = 0.60 + (lat_factor * 0.15) + (lon_factor * 0.10)
    ndvi = round(min(max(base_ndvi, 0.20), 0.95), 2)
    
    return ndvi, "demo"

def get_iot_data(field_id: int) -> Tuple[Dict[str, Any], str]:
    """
    IoT telemetry provider.
    Retrieves latest telemetry submitted by ESP32 or returns a simulated demo payload.
    """
    if field_id in iot_telemetry_store:
        data = iot_telemetry_store[field_id]
        return {
            "temperature": float(data.get("temperature", 28.0)),
            "humidity": float(data.get("humidity", 65.0)),
            "soil_moisture": float(data.get("soil_moisture", 40.0))
        }, "esp32"

    # Simulated ESP32 values
    seed = (field_id * 17) % 10
    demo_iot = {
        "temperature": round(27.0 + seed * 0.5, 1),
        "humidity": round(60.0 + seed * 1.5, 1),
        "soil_moisture": round(38.0 + seed * 1.2, 1)
    }
    return demo_iot, "demo"

def record_iot_data(field_id: int, temperature: float, humidity: float, soil_moisture: float) -> Dict[str, Any]:
    """
    Saves incoming ESP32 sensor telemetry for a given field.
    """
    telemetry = {
        "field_id": field_id,
        "temperature": temperature,
        "humidity": humidity,
        "soil_moisture": soil_moisture
    }
    iot_telemetry_store[field_id] = telemetry
    return telemetry
