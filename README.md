# SkyRoute – Smart Flight Route Planner

A DBMS mini-project built with **Node.js + Express + SQLite + Vanilla JS + Leaflet**.  
Computes optimal flight routes using **Dijkstra's algorithm** over a real relational database.

---

## Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Backend   | Node.js, Express 5               |
| Database  | SQLite via `better-sqlite3`      |
| Algorithm | Dijkstra's shortest path (JS)    |
| Frontend  | Vanilla JS, HTML5, CSS3          |
| Map       | Leaflet.js (great-circle arcs)   |
| Fonts     | Inter (Google Fonts)             |

---

## Project Structure

```
Smart Route Planner/
├── Backend/
│   ├── algorithms/dijkstra.js      # Dijkstra's algo (reads from DB)
│   ├── controllers/
│   │   ├── pathController.js       # POST /api/shortest-path
│   │   └── airportController.js    # Airport, stats, history endpoints
│   ├── db/
│   │   ├── database.js             # SQLite connection singleton
│   │   ├── schema.sql              # Normalized SQL schema
│   │   ├── seed.js                 # Seeds all 47 airports, 264 routes
│   │   └── skyroute.db             # SQLite database file
│   ├── models/
│   │   ├── Airport.js              # Airport queries (JOINs, aggregates)
│   │   ├── FlightSegment.js        # Segment queries with full JOINs
│   │   └── OptimizedRoute.js       # Route caching + history
│   ├── routes/
│   │   ├── pathRoutes.js           # /api/shortest-path
│   │   └── airportRoutes.js        # /api/airports, /api/stats, etc.
│   ├── index.js                    # Express server entry point
│   └── package.json
└── Frontend/
    ├── css/style.css               # Complete stylesheet
    ├── js/
    │   ├── main.js                 # Theme, navbar, map, API data loader
    │   └── dijkstra.js             # Client helpers (formatTime, greatCircle)
    ├── index.html                  # Landing page
    ├── dashboard.html              # Route planner (map + search)
    ├── server.js                   # Static file server (port 3001)
    └── package.json
```

---

## Setup & Running

### Prerequisites
- Node.js 18+

### 1 — Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 2 — Seed the database

```bash
cd Backend
node db/seed.js
```

This creates `Backend/db/skyroute.db` and populates all tables.

### 3 — Start the backend API

```bash
cd Backend
node index.js
# → SkyRoute backend running on port 5000
```

### 4 — Start the frontend server

```bash
cd Frontend
node server.js
# → http://localhost:3001/skyroute-html/
```

Open **http://localhost:3001/skyroute-html/** in your browser.

---

## API Endpoints

| Method | Endpoint                  | Description                               |
|--------|---------------------------|-------------------------------------------|
| GET    | `/`                       | Health check                              |
| GET    | `/api/airports`           | All airports with route counts            |
| GET    | `/api/airports/:code`     | Single airport detail                     |
| GET    | `/api/segments`           | All flight segments (edge list)           |
| GET    | `/api/stats`              | Network stats + top airports + airlines   |
| GET    | `/api/routes/history`     | Recent computed routes from DB            |
| POST   | `/api/shortest-path`      | Compute optimal route via Dijkstra        |

### POST /api/shortest-path

**Request:**
```json
{ "source": "DEL", "destination": "LHR", "optimizeBy": "cost" }
```

**Response:**
```json
{
  "found": true,
  "path": ["DEL", "LHR"],
  "steps": [{
    "from": "DEL", "to": "LHR",
    "fromName": "Delhi", "toName": "London",
    "distance": 6741, "time": 525, "cost": 740,
    "airline": "Air India", "aircraft": "Boeing 787-9 Dreamliner"
  }],
  "totalDistance": 6741,
  "totalTime": 525,
  "totalCost": 740
}
```

---

## Database Schema

### Tables

```sql
airports (iata_code PK, city_name, airport_name, latitude, longitude,
          airport_type, country, region)

airlines (iata_code PK, airline_name)

aircraft (model_code PK, model_name)

flight_segments (segment_id PK,
                 origin_code FK→airports, destination_code FK→airports,
                 distance_km, duration_min, base_cost_usd,
                 airline_code FK→airlines, aircraft_code FK→aircraft)

optimized_routes (route_id PK AUTOINCREMENT,
                  origin_code FK, destination_code FK,
                  optimization_type, path_codes,
                  total_distance_km, total_duration_min, total_cost_usd,
                  segment_count, computed_at,
                  UNIQUE(origin, destination, optimization_type))
```

### Indexes

```sql
idx_segments_origin      ON flight_segments(origin_code)
idx_segments_destination ON flight_segments(destination_code)
idx_segments_airline     ON flight_segments(airline_code)
idx_airports_region      ON airports(region)
idx_airports_type        ON airports(airport_type)
idx_routes_pair          ON optimized_routes(origin_code, destination_code)
idx_routes_computed_at   ON optimized_routes(computed_at)
```

### Network Stats

- 47 airports across 7 regions
- 21 major hubs · 8 international · 18 national
- 18 airlines · 8 aircraft types
- 264 bidirectional flight segments

---

## SQL Concepts Demonstrated

| Concept            | Where used                                               |
|--------------------|----------------------------------------------------------|
| Normalization (3NF)| airports, airlines, aircraft as separate reference tables|
| Foreign Keys       | flight_segments references all three lookup tables       |
| PRIMARY KEY        | Every table; AUTOINCREMENT on optimized_routes           |
| UNIQUE constraint  | (origin, destination, optimizeBy) in optimized_routes    |
| CHECK constraint   | airport_type enum; distance/cost positive values         |
| Indexes            | 7 indexes for performance on search/filter queries       |
| JOIN (INNER)       | FlightSegment queries join 4 tables                      |
| Aggregate queries  | COUNT, AVG, MIN, MAX in stats and airline breakdown      |
| GROUP BY           | Most-connected airports, airline stats                   |
| Subqueries         | Airport.getStats() uses correlated subqueries            |
| UPSERT (ON CONFLICT)| Optimized routes cached/updated without duplicates      |
| ORDER BY / LIMIT   | Route history sorted by computed_at DESC                 |
| PRAGMA foreign_keys| Enforced at connection level (WAL mode)                  |

---

## Viva / Demo Talking Points

1. **Why SQLite?** Serverless, zero-configuration, ideal for a self-contained demo. Same SQL standard as MySQL/PostgreSQL.

2. **Normalization:** Airlines and aircraft are lookup tables to avoid repeating names in 264 segment rows — classic 3NF decomposition.

3. **Dijkstra on SQL data:** The algorithm loads the edge list from `flight_segments` at runtime. Weights are `distance_km`, `duration_min`, or `base_cost_usd` depending on the optimization mode — same graph, three different weight vectors.

4. **UPSERT semantics:** `ON CONFLICT ... DO UPDATE` ensures repeated queries for the same pair/mode overwrite the cache instead of creating duplicates — demonstrates SQL constraint-driven deduplication.

5. **Indexes:** `idx_segments_origin` lets Dijkstra fetch outgoing edges in O(log n) vs full scan. Demonstrated with `EXPLAIN QUERY PLAN` in SQLite shell.

6. **JOINs:** Every segment result enriches with city names, airline names, and aircraft model by joining across 4 tables in a single query.

7. **REST API design:** Clean `/api` prefix, controller/model/route separation, proper HTTP status codes (400, 404, 500).

8. **Frontend → API → DB → Algorithm flow:** Browser calls POST /api/shortest-path → controller → Dijkstra reads DB edge list → result stored via UPSERT → history shown from SELECT query.

---

## Optional Future Improvements

- Add departure schedules (date/time dimension to segments)
- Flight search by airline or aircraft type
- Price range filter with SQL range queries
- Passenger bookings table with foreign key to routes
- Export route as PDF or share link
- Dark mode map tile caching
