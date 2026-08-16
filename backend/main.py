from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI()


class Field(BaseModel):
    name: str
    location: str
    crop: str
    area_acres: float


fields = []


@app.get("/")
def root():
    return {"message": "Agrishield-AI Backend is running"}


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "Agrishield-AI"
    }


@app.post("/api/fields")
def create_field(field: Field):
    field_id = len(fields) + 1

    field_data = {
        "id": field_id,
        **field.model_dump()
    }

    fields.append(field_data)

    return field_data


@app.get("/api/fields")
def get_fields():
    return fields


@app.get("/api/fields/{field_id}")
def get_field(field_id: int):
    for field in fields:
        if field["id"] == field_id:
            return field

    raise HTTPException(
        status_code=404,
        detail="Field not found"
    )