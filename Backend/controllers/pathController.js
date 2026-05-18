const dijkstra       = require('../algorithms/dijkstra');
const OptimizedRoute = require('../models/OptimizedRoute');

exports.getShortestPath = (req, res) => {
    try {
        const { source, destination, optimizeBy } = req.body;

        if (!source || !destination) {
            return res.status(400).json({ error: 'source and destination are required' });
        }
        if (source === destination) {
            return res.status(400).json({ error: 'source and destination must differ' });
        }

        const mode   = ['distance', 'time', 'cost'].includes(optimizeBy) ? optimizeBy : 'distance';
        const result = dijkstra(source, destination, mode);

        if (result.found) {
            // Cache the result in the DB
            OptimizedRoute.upsert({
                originCode:       source,
                destinationCode:  destination,
                optimizationType: mode,
                path:             result.path,
                totalDistance:    result.totalDistance,
                totalDuration:    result.totalTime,
                totalCost:        result.totalCost,
            });
        }

        return res.json(result);
    } catch (err) {
        console.error('[pathController]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
