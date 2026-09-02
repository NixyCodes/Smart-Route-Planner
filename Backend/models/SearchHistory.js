const { getDb } = require('../db/database');

const SearchHistory = {
    insert({ originCode, destinationCode, optimizationType, path, totalDistance, totalDuration, totalCost, totalLayover = 0 }) {
        return getDb().prepare(`
            INSERT INTO search_history
                (origin_code, destination_code, optimization_type, path_codes,
                 total_distance_km, total_duration_min, total_cost_usd,
                 total_layover_min, segment_count, searched_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(
            originCode, destinationCode, optimizationType,
            path.join(','),
            totalDistance, totalDuration, totalCost,
            totalLayover,
            path.length - 1
        );
    },

    getAll(limit = 50) {
        return getDb().prepare(`
            SELECT * FROM search_history
            ORDER BY searched_at DESC
            LIMIT ?
        `).all(limit);
    }
};

module.exports = SearchHistory;
