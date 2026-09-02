# SkyRoute ER Diagram - Generation Prompt

## Objective

Generate a high-quality Entity Relationship diagram in Chen notation as a PNG image using Python and matplotlib. The output file must be named `er_diagram.png`.

---

## Visual Style

| Property        | Value                           |
|-----------------|---------------------------------|
| Background      | `#060913` (deep navy black)     |
| Entity card fill| `#0D1526`                       |
| Border          | `#1E2D45`                       |
| Primary text    | `#F5F0E8` (off-white)           |
| Muted text      | `#8A8A9A`                       |
| Gold accent     | `#D4A853`                       |
| Font family     | DejaVu Sans (matplotlib built-in)|
| Canvas size     | 18 x 12 inches, 150 dpi         |
| Axis range      | 0.0 to 1.0 on both x and y      |

The diagram uses Chen ER notation with diamond shapes for relationships, rectangle entity boxes with attribute rows, and colored relationship lines. Every entity is a dark rounded card with a colored border and a semi-transparent tinted header strip matching its accent color.

---

## Entity Design

Each entity box must:
- Have a `FancyBboxPatch` outer card in `#0D1526` with a 2px colored border (`rounding_size=0.015`)
- Have a colored header strip at the top (same color as border, at 20% opacity: append `33` to hex)
- Display the entity name in the header, bold, in the entity's accent color
- List attributes in rows below the header with alternating row stripes (`#ffffff08`)
- Show a small rounded pill tag on the left: gold-tinted `PK` or purple-tinted `FK`
- Field names: bold gold for PK rows, off-white for all others, font size 7
- Row height distributes evenly across the remaining card height after the header

---

## Entity Positions and Accent Colors

All positions are `(center_x, center_y, width, height)` in axes 0-1 coordinates.

| Entity                | cx    | cy    | width | height | Color              |
|-----------------------|-------|-------|-------|--------|--------------------|
| airports              | 0.13  | 0.66  | 0.175 | 0.39   | `#D4A853` Gold     |
| airlines              | 0.38  | 0.78  | 0.175 | 0.27   | `#8B5CF6` Purple   |
| aircraft_types        | 0.62  | 0.78  | 0.175 | 0.20   | `#3B82F6` Blue     |
| flight_segments       | 0.50  | 0.42  | 0.175 | 0.39   | `#F97316` Orange   |
| route_history         | 0.13  | 0.22  | 0.175 | 0.30   | `#10B981` Green    |
| flight_segments_copy  | 0.78  | 0.42  | 0.175 | 0.39   | `#475569` Slate    |

---

## Entity Attribute Lists

### airports (Gold)
| Tag | Attribute     |
|-----|---------------|
| PK  | iata_code     |
|     | city_name     |
|     | airport_name  |
|     | latitude      |
|     | longitude     |
|     | airport_type  |
|     | country       |
|     | region        |

### airlines (Purple)
| Tag | Attribute    |
|-----|--------------|
| PK  | airline_code |
|     | airline_name |
|     | country      |
|     | rating       |
|     | delay_prob   |
|     | emissions_f  |

### aircraft_types (Blue)
| Tag | Attribute     |
|-----|---------------|
| PK  | aircraft_code |
|     | aircraft_name |
|     | range_km      |
|     | capacity      |

### flight_segments (Orange)
| Tag | Attribute          |
|-----|--------------------|
| PK  | segment_id         |
| FK  | origin_code        |
| FK  | destination_code   |
|     | distance_km        |
|     | duration_min       |
|     | base_cost_usd      |
| FK  | airline_code       |
| FK  | aircraft_code      |

### route_history (Green)
| Tag | Attribute          |
|-----|--------------------|
| PK  | route_id           |
| FK  | origin_code        |
| FK  | destination_code   |
|     | optimization_type  |
|     | total_cost_usd     |
|     | total_time_min     |
|     | segment_count      |
|     | computed_at        |

### flight_segments_copy (Slate)
| Tag | Attribute          |
|-----|--------------------|
| PK  | segment_id         |
|     | origin_code        |
|     | destination_code   |
|     | distance_km        |
|     | duration_min       |
|     | base_cost_usd      |
|     | airline_code       |
|     | aircraft_code      |
|     | copied_at          |

---

## Relationship Lines

Draw plain lines (no arrowhead, `arrowstyle='-'`) between entities. Each line has:
- A relationship label as italic muted text centered above the midpoint
- Cardinality labels (`1` or `N`) near each endpoint, bold, in the line color at ~80% alpha
- Cardinality labels offset ~0.06 units inward from each endpoint along the line direction

| From (x1, y1)     | To (x2, y2)       | Label        | Color   | Card from | Card to | Bend  |
|-------------------|-------------------|--------------|---------|-----------|---------|-------|
| (0.218, 0.600)    | (0.413, 0.540)    | departs from | Gold    | 1         | N       | +0.15 |
| (0.218, 0.570)    | (0.413, 0.500)    | arrives at   | Gold    | 1         | N       | -0.12 |
| (0.380, 0.645)    | (0.440, 0.615)    | operates     | Purple  | 1         | N       | 0.0   |
| (0.620, 0.680)    | (0.588, 0.615)    | flies as     | Blue    | 1         | N       | 0.0   |
| (0.130, 0.465)    | (0.130, 0.370)    | recorded in  | Green   | 1         | N       | 0.0   |
| (0.588, 0.420)    | (0.693, 0.420)    | synced to    | Slate   | 1         | 1       | 0.0   |

---

## Relationship Diamonds (Chen Notation)

Draw a diamond shape (rotated square using `matplotlib.patches.Polygon`) centered at each relationship midpoint. Each diamond:
- Width 0.038, height 0.022
- `facecolor` = relationship color at 27% alpha (append `44` to hex)
- `edgecolor` = relationship color at full opacity
- `linewidth` = 1.5
- Short label inside the diamond in the same color, font size 5.5 bold

| Center (cx, cy)   | Label     | Color  |
|-------------------|-----------|--------|
| (0.330, 0.570)    | departs   | Gold   |
| (0.320, 0.510)    | arrives   | Gold   |
| (0.408, 0.632)    | operates  | Purple |
| (0.605, 0.645)    | flies     | Blue   |
| (0.130, 0.418)    | logged    | Green  |
| (0.638, 0.420)    | copy      | Slate  |

---

## Title Section

At the top of the canvas:
- Large title: `SkyRoute  --  Entity Relationship Diagram` at y=0.965, font size 18, bold, gold, with a dark stroke path effect using `matplotlib.patheffects.withStroke(linewidth=4, foreground='#060913')`
- Subtitle at y=0.942, font size 10, muted: `Chen notation  |  5 entities  |  6 relationships  |  SQLite backend`
- Horizontal rule at y=0.933 from x=0.08 to x=0.92 in gold at 27% alpha

---

## Right Panel: Legend

Position at x=0.72, starting y=0.900. Title "Legend" in bold off-white, va='top'.

Render 8 items with a small colored swatch (0.013 x 0.022 rounded rectangle) then a label in muted text, spaced 0.038 apart vertically:

| Swatch Color | Label                              |
|--------------|------------------------------------|
| Gold         | airports  --  Hub / Intl / National|
| Purple       | airlines  --  carrier metadata     |
| Blue         | aircraft_types  --  fleet types    |
| Orange       | flight_segments  --  graph edges   |
| Green        | route_history  --  cached results  |
| Slate        | flight_segments_copy  --  mirror   |
| Gold         | PK  Primary Key                    |
| Purple       | FK  Foreign Key                    |

---

## Right Panel: Tech Stack

Position at x=0.72, y=0.555. Title "Tech Stack" in bold off-white, font size 9.

Lines (font size 6.8, muted, spaced 0.028 apart vertically):
1. `Database   :  SQLite  (better-sqlite3)`
2. `Backend    :  Node.js  /  Express`
3. `Algorithm  :  Dijkstra  (4 modes)`
4. `Frontend   :  Vanilla JS  /  Leaflet`
5. `Journal    :  DELETE  (no WAL)`
6. `FK mode    :  PRAGMA foreign_keys = ON`

---

## Output

```python
fig.savefig('er_diagram.png', dpi=150, bbox_inches='tight', facecolor='#060913', edgecolor='none')
```

Libraries required: `matplotlib` only (`pip install matplotlib`).
Use `matplotlib.use('Agg')` before importing pyplot to avoid display errors.
Import `matplotlib.patches.Polygon` for the diamond shapes in addition to `FancyBboxPatch`.
