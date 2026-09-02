const { getDb } = require('../db/database');

const SearchLog = {
    insert({ originCode, destinationCode, optimizationType, path, totalDistance, totalDuration, totalCost, totalLayover = 0 }) {
        return getDb().prepare(`
            INSERT INTO route_search_log
                (origin_code, destination_code, optimization_type, path_codes,
                 total_distance_km, total_duration_min, total_cost_usd,
                 total_layover_min, segment_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            originCode, destinationCode, optimizationType,
            path.join(','),
            totalDistance, totalDuration, totalCost,
            totalLayover,
            path.length - 1
        );
    },

    getAll(limit = 100) {
        return getDb().prepare(`
            SELECT
                l.log_id, l.origin_code, l.destination_code,
                l.optimization_type, l.path_codes,
                l.total_distance_km, l.total_duration_min, l.total_cost_usd,
                l.total_layover_min, l.segment_count, l.searched_at,
                ao.city_name AS origin_city,
                ad.city_name AS dest_city
            FROM route_search_log l
            JOIN airports ao ON l.origin_code = ao.iata_code
            JOIN airports ad ON l.destination_code = ad.iata_code
            ORDER BY l.searched_at DESC
            LIMIT ?
        `).all(limit);
    },
};

module.exports = SearchLog;
