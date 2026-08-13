from fastapi import FastAPI

app = FastAPI(
    title="AgriShield AI",
    description="Agricultural Disease & Pest Early Warning Platform",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to AgriShield AI",
        "status": "running"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgriShield AI Backend"
    }
@app.get("/api/field")
def get_field():
    return {
        "field_id": "FIELD_001",
        "crop": "Wheat",
        "location": "Prayagraj",
        "area_acres": 5
    }