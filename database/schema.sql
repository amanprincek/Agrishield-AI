-- ============================================================
-- AgriShield-AI — Database Schema
-- Aligned 2026-09-24: uses live DB name `agrishield` (not agrishield_db)
-- Safe for fresh developers: does NOT drop existing data
-- For existing local DB, this file is documentation + fresh-install DDL
-- See DATABASE_MIGRATION_NOTES below
-- ============================================================

CREATE DATABASE IF NOT EXISTS agrishield;

USE agrishield;

-- ------------------------------------------------------------
-- fields — core table used by FastAPI FieldModel
-- Current live columns (DESCRIBE fields 2026-09-24):
--  id, farmer_name, user_id, name, location, crop, area_acres,
--  created_at, latitude, longitude
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_name VARCHAR(100) NOT NULL DEFAULT 'Aman Kumar',
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    area_acres DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    KEY idx_fields_user_id (user_id),
    KEY idx_fields_farmer_name (farmer_name)
);

-- ------------------------------------------------------------
-- DATABASE_MIGRATION_NOTES (no destructive statements)
-- ------------------------------------------------------------
-- Fresh install: run
--   Get-Content database/schema.sql | mysql -u root -p
--   then verify: mysql -u root -p -e "USE agrishield; DESCRIBE fields;"
--
-- Existing install (agrishield already exists):
--  * DO NOT run DROP TABLE. Data is preserved.
--  * If your local `fields` was created from the old schema
--    (agrishield_db, latitude DECIMAL(9,6) NOT NULL), run this
--    safe ALTER once (skip errors if already applied):
--
--   ALTER TABLE fields ADD COLUMN user_id INT NULL AFTER farmer_name;
--   ALTER TABLE fields MODIFY COLUMN latitude DECIMAL(10, 7) NULL;
--   ALTER TABLE fields MODIFY COLUMN longitude DECIMAL(10, 7) NULL;
--   CREATE INDEX idx_fields_user_id ON fields (user_id);
--
--  The live DB also contains auxiliary tables (users, alerts,
--  auth_sessions, risk_assessments, sensor_readings, satellite_ndvi,
--  weather_snapshots) — they are managed by application migrations
--  and not recreated here to avoid accidental loss.
-- ------------------------------------------------------------
