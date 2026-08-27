import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Numeric, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

load_dotenv()
# MySQL Database Configuration
# In local development, configured via environment variables or default local credentials
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "agrishield_db")

# Standard connection URL: mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>
# SQLite fallback support included for zero-friction local developer testing without a running MySQL instance
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# If running on local machine without MySQL running, can use sqlite:///./agrishield.db
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class FieldModel(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_name = Column(String(100), nullable=False, default="Aman")
    name = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    latitude = Column(Numeric(9, 6), nullable=False, default=25.435800)
    longitude = Column(Numeric(9, 6), nullable=False, default=81.846300)
    crop = Column(String(100), nullable=False)
    area_acres = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
