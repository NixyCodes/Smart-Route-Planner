# SkyRoute Database Schema Diagram - Generation Prompt

## Objective

Generate a high-quality, professional database schema diagram as a PNG image using Python and matplotlib. The output file must be named `schema.png`.

---

## Visual Style

| Property       | Value                          |
|----------------|-------------------------------|
| Background     | `#060913` (deep navy black)   |
| Card fill      | `#0D1526`                     |
| Border         | `#1E2D45`                     |
| Primary text   | `#F5F0E8` (off-white)         |
| Muted text     | `#8A8A9A`                     |
| Gold accent    | `#D4A853`                     |
| Font family    | DejaVu Sans (matplotlib built-in) |
| Canvas size    | 18 x 12 inches, 150 dpi        |
| Corner radius  | FancyBboxPatch with rounding_size=0.012 |

The overall aesthetic is a luxury dark dashboard -- no white backgrounds, no flat colors. Every table is a rounded dark card with a colored header strip. The diagram should feel like a high-end analytics tool.

---

## Layout

Place all tables in the upper-center region of the canvas (y range 0.45 to 0.92 in axes coordinates). Leave the right 25% of the canvas (x > 0.70) for a legend panel and a database constraints notes panel. Use a coordinate system of 0.0 to 1.0 on both axes.

### Table Positions (x_left, y_top, width)

| Table                 | x      | y_top  | width  | Header Color       |
|-----------------------|--------|--------|--------|--------------------|
| airports              | 0.03   | 0.905  | 0.19   | `#D4A853` (Gold)   |
| airlines              | 0.255  | 0.905  | 0.19   | `#8B5CF6` (Purple) |
| aircraft_types        | 0.48   | 0.905  | 0.19   | `#3B82F6` (Blue)   |
| flight_segments       | 0.255  | 0.595  | 0.19   | `#F97316` (Orange) |
| route_history         | 0.03   | 0.595  | 0.19   | `#10B981` (Green)  |
| flight_segments_copy  | 0.48   | 0.595  | 0.19   | `#475569` (Slate)  |

---

## Table Schemas

Each table is rendered as a card with:
- A colored header bar (height 0.038) showing the table name in bold, dark text
- Alternating slightly-lighter row stripes for every even row
- A small pill/tag on the left of each row showing PK (gold) or FK (purple) where applicable
- Field name in the middle (bold gold for PK rows, off-white for others)
- Data type right-aligned in italic muted text

### airports
| Tag | Field         | Type    |
|-----|---------------|---------|
| PK  | iata_code     | TEXT    |
|     | city_name     | TEXT    |
|     | airport_name  | TEXT    |
|     | latitude      | REAL    |
|     | longitude     | REAL    |
|     | airport_type  | TEXT    |
|     | country       | TEXT    |
|     | region        | TEXT    |

### airlines
| Tag | Field        | Type |
|-----|--------------|------|
| PK  | airline_code | TEXT |
|     | airline_name | TEXT |
|     | country      | TEXT |
|     | rating       | REAL |
|     | delay_prob   | REAL |
|     | emissions_f  | REAL |

### aircraft_types
| Tag | Field         | Type    |
|-----|---------------|---------|
| PK  | aircraft_code | TEXT    |
|     | aircraft_name | TEXT    |
|     | range_km      | INTEGER |
|     | capacity      | INTEGER |

### flight_segments
| Tag | Field             | Type    |
|-----|-------------------|---------|
| PK  | segment_id        | TEXT    |
| FK  | origin_code       | TEXT    |
| FK  | destination_code  | TEXT    |
|     | distance_km       | INTEGER |
|     | duration_min      | INTEGER |
|     | base_cost_usd     | INTEGER |
| FK  | airline_code      | TEXT    |
| FK  | aircraft_code     | TEXT    |

### route_history
| Tag | Field             | Type     |
|-----|-------------------|----------|
| PK  | route_id          | TEXT     |
| FK  | origin_code       | TEXT     |
| FK  | destination_code  | TEXT     |
|     | optimization_type | TEXT     |
|     | total_cost_usd    | INTEGER  |
|     | total_time_min    | INTEGER  |
|     | segment_count     | INTEGER  |
|     | computed_at       | DATETIME |

### flight_segments_copy
| Tag | Field             | Type     |
|-----|-------------------|----------|
| PK  | segment_id        | TEXT     |
|     | origin_code       | TEXT     |
|     | destination_code  | TEXT     |
|     | distance_km       | INTEGER  |
|     | duration_min      | INTEGER  |
|     | base_cost_usd     | INTEGER  |
|     | airline_code      | TEXT     |
|     | aircraft_code     | TEXT     |
|     | copied_at         | DATETIME |

---

## Foreign Key Arrows

Draw curved arrows using matplotlib `annotate` with `arrowstyle='->'` and `connectionstyle='arc3,rad=<bend>'`. Arrow color should use the source table's header color with ~67% alpha (append `aa` to hex).

| From (x, y)          | To (x, y)            | Color base | Bend  | Label                   |
|----------------------|----------------------|------------|-------|-------------------------|
| (0.13, 0.595)        | (0.255, 0.545)       | Gold       | +0.15 | origin FK               |
| (0.13, 0.590)        | (0.444, 0.540)       | Gold       | -0.20 | dest FK                 |
| (0.345, 0.710)       | (0.345, 0.595)       | Purple     | 0.0   | airline FK              |
| (0.575, 0.720)       | (0.444, 0.535)       | Blue       | +0.18 | aircraft FK             |
| (0.13, 0.710)        | (0.13, 0.595)        | Green      | 0.0   | airport FK (history)    |

Also draw a dashed arrow from `(0.444, 0.540)` to `(0.48, 0.540)` in slate `#475569` for the sync copy relationship, with label `sync copy` above it.

---

## Title Section

At the top of the canvas:
- Large title: `SkyRoute  -  Database Schema` at y=0.965, font size 18, bold, gold, with a dark stroke path effect
- Subtitle at y=0.942, font size 10, muted: `SQLite  |  better-sqlite3  |  5 tables  |  Foreign key constraints  |  journal_mode=DELETE`
- Horizontal rule at y=0.933 from x=0.08 to x=0.92 in gold 27% alpha

---

## Right Panel: Legend

Position at x=0.72, starting y=0.90. Title "Legend" in bold off-white.

Items (color swatch + label):
- Gold: `PK  Primary Key`
- Purple: `FK  Foreign Key`
- Gold: `airports  --  Hub / Intl / National`
- Purple: `airlines  --  carrier metadata`
- Blue: `aircraft_types  --  fleet types`
- Orange: `flight_segments  --  graph edges`
- Green: `route_history  --  cached query results`
- Slate `#475569`: `flight_segments_copy  --  mirror backup`

Each swatch is a 0.013 wide x 0.023 tall rounded rectangle.

---

## Right Panel: Constraints Notes

Position at x=0.72, y=0.575. Title "Database Constraints & Notes" in bold off-white, font size 9.

Notes (font size 6.8, muted, spaced 0.031 apart vertically):
1. `journal_mode = DELETE  (no WAL, writes flush to .db immediately)`
2. `foreign_keys = ON  (referential integrity enforced)`
3. `flight_segments.origin_code  --FK-->  airports.iata_code`
4. `flight_segments.airline_code --FK-->  airlines.airline_code`
5. `flight_segments.aircraft_code --FK--> aircraft_types.aircraft_code`
6. `route_history uses INSERT OR REPLACE  (upsert semantics)`
7. `flight_segments_copy: no FK constraints, synced via app layer`
8. `segment_id format: alphanumeric text  (e.g. FS001, WS123)`

---

## Output

```python
fig.savefig('schema.png', dpi=150, bbox_inches='tight', facecolor='#060913', edgecolor='none')
```

Libraries required: `matplotlib` only (`pip install matplotlib`).
Use `matplotlib.use('Agg')` before importing pyplot to avoid display errors.
