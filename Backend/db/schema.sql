-- ============================================================
--  SkyRoute – SQL Schema
--  Normalized to 3NF. Run via: node db/seed.js
-- ============================================================

PRAGMA foreign_keys = ON;

-- ── Core reference tables ────────────────────────────────────

CREATE TABLE IF NOT EXISTS airports (
  iata_code    TEXT PRIMARY KEY,
  city_name    TEXT NOT NULL,
  airport_name TEXT NOT NULL,
  latitude     REAL NOT NULL,
  longitude    REAL NOT NULL,
  airport_type TEXT NOT NULL CHECK(airport_type IN ('hub','international','national')),
  country      TEXT NOT NULL,
  region       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS airlines (
  iata_code    TEXT PRIMARY KEY,
  airline_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS aircraft (
  model_code   TEXT PRIMARY KEY,
  model_name   TEXT NOT NULL
);

-- ── Flight segments ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS flight_segments (
  segment_id       TEXT PRIMARY KEY,
  origin_code      TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  distance_km      INTEGER NOT NULL CHECK(distance_km > 0),
  duration_min     INTEGER NOT NULL CHECK(duration_min > 0),
  base_cost_usd    INTEGER NOT NULL CHECK(base_cost_usd > 0),
  airline_code     TEXT NOT NULL,
  aircraft_code    TEXT NOT NULL,
  FOREIGN KEY (origin_code)      REFERENCES airports(iata_code),
  FOREIGN KEY (destination_code) REFERENCES airports(iata_code),
  FOREIGN KEY (airline_code)     REFERENCES airlines(iata_code),
  FOREIGN KEY (aircraft_code)    REFERENCES aircraft(model_code)
);

-- ── Computed / cached optimal routes ────────────────────────

CREATE TABLE IF NOT EXISTS optimized_routes (
  route_id          INTEGER PRIMARY KEY AUTOINCREMENT,
  origin_code       TEXT NOT NULL,
  destination_code  TEXT NOT NULL,
  optimization_type TEXT NOT NULL CHECK(optimization_type IN ('distance','time','cost')),
  path_codes        TEXT NOT NULL,   -- comma-separated IATA codes
  total_distance_km INTEGER NOT NULL,
  total_duration_min INTEGER NOT NULL,
  total_cost_usd    INTEGER NOT NULL,
  segment_count     INTEGER NOT NULL,
  computed_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (origin_code)      REFERENCES airports(iata_code),
  FOREIGN KEY (destination_code) REFERENCES airports(iata_code),
  UNIQUE(origin_code, destination_code, optimization_type)
);

-- ── Indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_segments_origin      ON flight_segments(origin_code);
CREATE INDEX IF NOT EXISTS idx_segments_destination ON flight_segments(destination_code);
CREATE INDEX IF NOT EXISTS idx_segments_airline     ON flight_segments(airline_code);
CREATE INDEX IF NOT EXISTS idx_airports_region      ON airports(region);
CREATE INDEX IF NOT EXISTS idx_airports_type        ON airports(airport_type);
CREATE INDEX IF NOT EXISTS idx_routes_pair          ON optimized_routes(origin_code, destination_code);
CREATE INDEX IF NOT EXISTS idx_routes_computed_at   ON optimized_routes(computed_at);
