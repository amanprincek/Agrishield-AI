import os

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional

from backend.database import get_db, Base, engine, FieldModel
from backend.prediction import analyze_field
from backend.data_sources import record_iot_data


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[Database Setup Note]: {e}")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AgriShield-AI API",
    description="Backend API for Smart India Hackathon Agricultural Field & Risk Monitoring",
    version="1.0.0"
)
@app.get("/")
def root():
    return {
        "message": "AgriShield-AI Backend is running",
        "docs": "/docs",
        "health": "/api/health"
    }

# ============================================================
# CORS — restricted to explicit origins (no wildcard + credentials)
# Override via CORS_ORIGINS or ALLOWED_ORIGINS env (comma-separated)
# ============================================================

_cors_env = os.getenv("CORS_ORIGINS") or os.getenv("ALLOWED_ORIGINS") or "http://localhost:3000,http://127.0.0.1:3000"
_allowed_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class FieldCreate(BaseModel):
    farmer_name: str = Field(
        default="Aman Kumar",
        description="Name of the registered farmer"
    )

    name: str = Field(
        ...,
        description="Name or title of the field"
    )

    location: str = Field(
        ...,
        description="Village / District / State"
    )

    latitude: float = Field(
        default=25.435800,
        description="Latitude in decimal degrees"
    )

    longitude: float = Field(
        default=81.846300,
        description="Longitude in decimal degrees"
    )

    crop: str = Field(
        ...,
        description="Primary cultivated crop"
    )

    area_acres: float = Field(
        ...,
        description="Land area in acres"
    )


class FieldUpdate(BaseModel):
    farmer_name: Optional[str] = None
    name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    crop: Optional[str] = None
    area_acres: Optional[float] = None


class FieldResponse(BaseModel):
    id: int
    farmer_name: str
    name: str
    location: str
    latitude: float
    longitude: float
    crop: str
    area_acres: float

    class Config:
        from_attributes = True


class IoTDataPayload(BaseModel):
    field_id: int
    temperature: float
    humidity: float
    soil_moisture: float


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "Agrishield-AI",
        "architecture": "FastAPI + MySQL",
        "version": "1.0.0"
    }


# ============================================================
# GET ALL FIELDS
# ============================================================

@app.get(
    "/api/fields",
    response_model=List[FieldResponse]
)
def get_all_fields(
    farmer_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve all registered agricultural fields.
    Optional farmer_name filter is supported.
    """

    try:
        query = db.query(FieldModel)

        if farmer_name:
            query = query.filter(
                FieldModel.farmer_name == farmer_name
            )

        fields = query.order_by(
            FieldModel.id.desc()
        ).all()

        # ----------------------------------------------------
        # Demo seed data
        # ----------------------------------------------------

        if len(fields) == 0 and not farmer_name:

            samples = [
                FieldModel(
                    farmer_name="Aman Kumar",
                    name="North Field",
                    location="Prayagraj, Uttar Pradesh",
                    latitude=25.435800,
                    longitude=81.846300,
                    crop="Wheat",
                    area_acres=5.5
                ),

                FieldModel(
                    farmer_name="Aman Kumar",
                    name="East River Plot",
                    location="Varanasi, Uttar Pradesh",
                    latitude=25.317600,
                    longitude=82.973900,
                    crop="Rice / Paddy",
                    area_acres=8.0
                ),

                FieldModel(
                    farmer_name="Ramesh Singh",
                    name="Green Valley Farm",
                    location="Lucknow, Uttar Pradesh",
                    latitude=26.846700,
                    longitude=80.946200,
                    crop="Mustard",
                    area_acres=3.2
                )
            ]

            db.add_all(samples)
            db.commit()

            fields = db.query(FieldModel).order_by(
                FieldModel.id.desc()
            ).all()

        return fields

    except Exception as e:
        print(f"[GET FIELDS ERROR] {e}")

        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve fields: {str(e)}"
        )


# ============================================================
# GET SINGLE FIELD
# ============================================================

@app.get(
    "/api/fields/{field_id}",
    response_model=FieldResponse
)
def get_field_by_id(
    field_id: int,
    db: Session = Depends(get_db)
):

    try:
        field = db.query(FieldModel).filter(
            FieldModel.id == field_id
        ).first()

        if not field:
            raise HTTPException(
                status_code=404,
                detail="Field record not found"
            )

        return field

    except HTTPException:
        raise

    except Exception as e:
        print(f"[GET FIELD ERROR] {e}")

        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve field: {str(e)}"
        )


# ============================================================
# CREATE / REGISTER FIELD
# ============================================================

@app.post(
    "/api/fields",
    response_model=FieldResponse,
    status_code=status.HTTP_201_CREATED
)
def create_field(
    field_in: FieldCreate,
    db: Session = Depends(get_db)
):

    try:

        print("\n========================================")
        print("[CREATE FIELD]")
        print(field_in.model_dump())
        print("========================================\n")

        new_field = FieldModel(
            farmer_name=field_in.farmer_name,
            name=field_in.name,
            location=field_in.location,
            latitude=field_in.latitude,
            longitude=field_in.longitude,
            crop=field_in.crop,
            area_acres=field_in.area_acres
        )

        db.add(new_field)

        db.commit()

        db.refresh(new_field)

        print(
            f"[FIELD CREATED] ID = {new_field.id}"
        )

        return new_field

    except Exception as e:

        db.rollback()

        print(
            f"[CREATE FIELD ERROR] {repr(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Unable to save field: {str(e)}"
        )


# ============================================================
# UPDATE FIELD
# ============================================================

@app.put(
    "/api/fields/{field_id}",
    response_model=FieldResponse
)
def update_field(
    field_id: int,
    field_in: FieldUpdate,
    db: Session = Depends(get_db)
):

    try:

        field = db.query(FieldModel).filter(
            FieldModel.id == field_id
        ).first()

        if not field:
            raise HTTPException(
                status_code=404,
                detail="Field record not found"
            )

        update_data = field_in.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(field, key, value)

        db.commit()

        db.refresh(field)

        return field

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        print(
            f"[UPDATE FIELD ERROR] {repr(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Unable to update field: {str(e)}"
        )


# ============================================================
# DELETE FIELD
# ============================================================

@app.delete("/api/fields/{field_id}")
def delete_field(
    field_id: int,
    db: Session = Depends(get_db)
):

    try:

        field = db.query(FieldModel).filter(
            FieldModel.id == field_id
        ).first()

        if not field:
            raise HTTPException(
                status_code=404,
                detail="Field record not found"
            )

        db.delete(field)

        db.commit()

        return {
            "message": "Field deleted successfully",
            "id": field_id
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        print(
            f"[DELETE FIELD ERROR] {repr(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Unable to delete field: {str(e)}"
        )


# ============================================================
# AI FIELD RISK PREDICTION
# ============================================================

@app.post("/api/prediction/{field_id}")
def predict_field_risk(
    field_id: int,
    db: Session = Depends(get_db)
):

    try:

        field = db.query(FieldModel).filter(
            FieldModel.id == field_id
        ).first()

        if not field:
            raise HTTPException(
                status_code=404,
                detail="Field record not found"
            )

        result = analyze_field(
            field_id=field.id,
            field_name=field.name,
            crop=field.crop,
            latitude=float(field.latitude),
            longitude=float(field.longitude)
        )

        return result

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"[PREDICTION ERROR] {repr(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# ============================================================
# IoT / ESP32 DATA INGESTION
# ============================================================

@app.post("/api/iot/data")
def ingest_iot_data(
    payload: IoTDataPayload
):

    try:

        recorded = record_iot_data(
            field_id=payload.field_id,
            temperature=payload.temperature,
            humidity=payload.humidity,
            soil_moisture=payload.soil_moisture
        )

        return {
            "status": "success",
            "message": (
                f"Telemetry recorded for field "
                f"{payload.field_id}"
            ),
            "data": recorded
        }

    except Exception as e:

        print(
            f"[IOT ERROR] {repr(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"IoT data ingestion failed: {str(e)}"
        )