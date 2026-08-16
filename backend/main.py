from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.database import get_db_connection


app = FastAPI()


class Field(BaseModel):
    name: str
    location: str
    crop: str
    area_acres: float





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
    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO fields (name, location, crop, area_acres)
        VALUES (%s, %s, %s, %s)
    """

    values = (
        field.name,
        field.location,
        field.crop,
        field.area_acres
    )

    cursor.execute(query, values)
    connection.commit()

    field_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "id": field_id,
        **field.model_dump()
    }


@app.get("/api/fields")
def get_fields():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM fields ORDER BY id")

    fields = cursor.fetchall()

    cursor.close()
    connection.close()

    return fields


@app.get("/api/fields/{field_id}")
def get_field(field_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = "SELECT * FROM fields WHERE id = %s"

    cursor.execute(query, (field_id,))

    field = cursor.fetchone()

    cursor.close()
    connection.close()

    if field is None:
        raise HTTPException(
            status_code=404,
            detail="Field not found"
        )

    return field