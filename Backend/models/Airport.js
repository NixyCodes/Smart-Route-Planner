const { getDb } = require('../db/database');

const Airport = {
    getAll() {
        return getDb().prepare(`
            SELECT
                a.iata_code, a.city_name, a.airport_name,
                a.latitude, a.longitude, a.airport_type,
                a.country, a.region,
                COUNT(DISTINCT fs.segment_id) AS route_count
            FROM airports a
            LEFT JOIN flight_segments fs
                ON fs.origin_code = a.iata_code OR fs.destination_code = a.iata_code
            GROUP BY a.iata_code
            ORDER BY a.region, a.city_name
        `).all();
    },

    getByCode(iata) {
        return getDb().prepare(`
            SELECT
                a.*,
                COUNT(DISTINCT fs.segment_id) AS route_count
            FROM airports a
            LEFT JOIN flight_segments fs
                ON fs.origin_code = a.iata_code OR fs.destination_code = a.iata_code
            WHERE a.iata_code = ?
            GROUP BY a.iata_code
        `).get(iata);
    },

    getByRegion(region) {
        return getDb().prepare(`
            SELECT * FROM airports WHERE region = ? ORDER BY city_name
        `).all(region);
    },

    // Most connected airports by number of direct routes
    getMostConnected(limit = 10) {
        return getDb().prepare(`
            SELECT
                a.iata_code, a.city_name, a.airport_type, a.country, a.region,
                COUNT(DISTINCT
                    CASE WHEN fs.origin_code = a.iata_code THEN fs.destination_code
                         WHEN fs.destination_code = a.iata_code THEN fs.origin_code
                    END
                ) AS connections
            FROM airports a
            LEFT JOIN flight_segments fs
                ON fs.origin_code = a.iata_code OR fs.destination_code = a.iata_code
            GROUP BY a.iata_code
            ORDER BY connections DESC
            LIMIT ?
        `).all(limit);
    },

    getStats() {
        return getDb().prepare(`
            SELECT
                (SELECT COUNT(*) FROM airports)                                     AS total_airports,
                (SELECT COUNT(*) FROM airports WHERE airport_type = 'hub')          AS hub_count,
                (SELECT COUNT(*) FROM airports WHERE airport_type = 'international') AS international_count,
                (SELECT COUNT(*) FROM airports WHERE airport_type = 'national')     AS national_count,
                (SELECT COUNT(DISTINCT region) FROM airports)                       AS region_count,
                (SELECT COUNT(*) FROM airlines)                                     AS airline_count,
                (SELECT COUNT(*) FROM flight_segments)                              AS segment_count,
                (SELECT COUNT(*) FROM aircraft)                                     AS aircraft_count
        `).get();
    },
};

module.exports = Airport;
