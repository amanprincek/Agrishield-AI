from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from backend.database import get_db_connection


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

@app.delete("/api/fields/{field_id}")
def delete_field(field_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM fields WHERE id = %s",
        (field_id,)
    )

    connection.commit()

    if cursor.rowcount == 0:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Field not found"
        )

    cursor.close()
    connection.close()

    return {
        "message": "Field deleted successfully",
        "id": field_id
    }

@app.put("/api/fields/{field_id}")
def update_field(field_id: int, field: Field):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE fields
        SET name = %s,
            location = %s,
            crop = %s,
            area_acres = %s
        WHERE id = %s
        """,
        (
            field.name,
            field.location,
            field.crop,
            field.area_acres,
            field_id
        )
    )

    connection.commit()

    if cursor.rowcount == 0:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Field not found"
        )

    cursor.execute(
        "SELECT id, name, location, crop, area_acres FROM fields WHERE id = %s",
        (field_id,)
    )

    updated_field = cursor.fetchone()

    cursor.close()
    connection.close()

    return updated_field

    return field