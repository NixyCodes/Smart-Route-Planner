const { optimize, compareAll } = require('../algorithms/optimizer');
const OptimizedRoute = require('../models/OptimizedRoute');

const VALID_MODES = ['cheapest', 'fastest', 'smart', 'min_layover'];

exports.getShortestPath = (req, res) => {
    try {
        const { source, destination, optimizeBy } = req.body;

        if (!source || !destination) {
            return res.status(400).json({ error: 'source and destination are required' });
        }
        if (source === destination) {
            return res.status(400).json({ error: 'source and destination must differ' });
        }

        const mode   = VALID_MODES.includes(optimizeBy) ? optimizeBy : 'smart';
        const result = optimize(source, destination, mode);

        if (result.found) {
            OptimizedRoute.upsert({
                originCode:       source,
                destinationCode:  destination,
                optimizationType: mode,
                path:             result.path,
                totalDistance:    result.totalDistance,
                totalDuration:    result.totalTime,
                totalCost:        result.totalCost,
                totalLayover:     result.totalLayover,
            });
        }

        return res.json(result);
    } catch (err) {
        console.error('[pathController.getShortestPath]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.compareRoutes = (req, res) => {
    try {
        const { source, destination } = req.body;

        if (!source || !destination) {
            return res.status(400).json({ error: 'source and destination are required' });
        }
        if (source === destination) {
            return res.status(400).json({ error: 'source and destination must differ' });
        }

        const comparison = compareAll(source, destination);

        // Cache every found result
        for (const [mode, result] of Object.entries(comparison)) {
            if (result.found) {
                OptimizedRoute.upsert({
                    originCode:       source,
                    destinationCode:  destination,
                    optimizationType: mode,
                    path:             result.path,
                    totalDistance:    result.totalDistance,
                    totalDuration:    result.totalTime,
                    totalCost:        result.totalCost,
                    totalLayover:     result.totalLayover,
                });
            }
        }

        return res.json({ source, destination, comparison });
    } catch (err) {
        console.error('[pathController.compareRoutes]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
