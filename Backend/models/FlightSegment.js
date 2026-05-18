const { getDb } = require('../db/database');

// Full JOIN query reused across methods
const SEGMENT_SELECT = `
    SELECT
        fs.segment_id, fs.origin_code, fs.destination_code,
        fs.distance_km, fs.duration_min, fs.base_cost_usd,
        fs.airline_code, fs.aircraft_code,
        ao.city_name   AS origin_city,
        ao.airport_name AS origin_airport,
        ao.latitude    AS origin_lat,
        ao.longitude   AS origin_lng,
        ad.city_name   AS dest_city,
        ad.airport_name AS dest_airport,
        ad.latitude    AS dest_lat,
        ad.longitude   AS dest_lng,
        al.airline_name,
        ac.model_name  AS aircraft_name
    FROM flight_segments fs
    JOIN airports ao ON fs.origin_code      = ao.iata_code
    JOIN airports ad ON fs.destination_code = ad.iata_code
    JOIN airlines al ON fs.airline_code     = al.iata_code
    JOIN aircraft ac ON fs.aircraft_code    = ac.model_code
`;

const FlightSegment = {
    getAll() {
        return getDb().prepare(`${SEGMENT_SELECT} ORDER BY fs.segment_id`).all();
    },

    getFromOrigin(originCode) {
        return getDb().prepare(`
            ${SEGMENT_SELECT}
            WHERE fs.origin_code = ?
            ORDER BY fs.distance_km
        `).all(originCode);
    },

    // Minimal edge list used to build the Dijkstra graph
    getEdgeList() {
        return getDb().prepare(`
            SELECT
                segment_id, origin_code, destination_code,
                distance_km, duration_min, base_cost_usd,
                airline_code, aircraft_code
            FROM flight_segments
        `).all();
    },

    // Airline-wise segment count (aggregate query)
    getAirlineStats() {
        return getDb().prepare(`
            SELECT
                al.iata_code,
                al.airline_name,
                COUNT(fs.segment_id)         AS segment_count,
                AVG(fs.distance_km)          AS avg_distance,
                AVG(fs.base_cost_usd)        AS avg_cost,
                MIN(fs.base_cost_usd)        AS min_cost,
                MAX(fs.distance_km)          AS max_distance
            FROM airlines al
            LEFT JOIN flight_segments fs ON al.iata_code = fs.airline_code
            GROUP BY al.iata_code
            ORDER BY segment_count DESC
        `).all();
    },
};

module.exports = FlightSegment;
