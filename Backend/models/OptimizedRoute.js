const { getDb } = require('../db/database');

const OptimizedRoute = {
    // Upsert a computed route result
    upsert({ originCode, destinationCode, optimizationType, path, totalDistance, totalDuration, totalCost }) {
        return getDb().prepare(`
            INSERT INTO optimized_routes
                (origin_code, destination_code, optimization_type, path_codes,
                 total_distance_km, total_duration_min, total_cost_usd, segment_count, computed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(origin_code, destination_code, optimization_type)
            DO UPDATE SET
                path_codes        = excluded.path_codes,
                total_distance_km = excluded.total_distance_km,
                total_duration_min= excluded.total_duration_min,
                total_cost_usd    = excluded.total_cost_usd,
                segment_count     = excluded.segment_count,
                computed_at       = CURRENT_TIMESTAMP
        `).run(
            originCode, destinationCode, optimizationType,
            path.join(','),
            totalDistance, totalDuration, totalCost,
            path.length - 1
        );
    },

    // Recent route history with city name JOINs
    getHistory(limit = 15) {
        return getDb().prepare(`
            SELECT
                r.route_id, r.origin_code, r.destination_code,
                r.optimization_type, r.path_codes,
                r.total_distance_km, r.total_duration_min, r.total_cost_usd,
                r.segment_count, r.computed_at,
                ao.city_name AS origin_city,
                ad.city_name AS dest_city
            FROM optimized_routes r
            JOIN airports ao ON r.origin_code      = ao.iata_code
            JOIN airports ad ON r.destination_code = ad.iata_code
            ORDER BY r.computed_at DESC
            LIMIT ?
        `).all(limit);
    },

    // Aggregate stats across all cached routes
    getSummaryStats() {
        return getDb().prepare(`
            SELECT
                COUNT(*)                  AS total_queries,
                AVG(total_distance_km)    AS avg_distance,
                AVG(total_duration_min)   AS avg_duration,
                AVG(total_cost_usd)       AS avg_cost,
                MIN(total_cost_usd)       AS min_cost,
                MAX(total_distance_km)    AS max_distance
            FROM optimized_routes
        `).get();
    },
};

module.exports = OptimizedRoute;
