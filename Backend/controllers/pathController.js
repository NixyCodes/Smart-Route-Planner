const dijkstra = require('../algorithms/dijkstra');

exports.getShortestPath = (req, res) => {

    try {

        const { source, destination, optimizeBy } = req.body;

        if (!source || !destination) {

            return res.status(400).json({
                error: 'Source and destination required'
            });
        }

        const result = dijkstra(
            source,
            destination,
            optimizeBy || 'distance'
        );

        return res.json(result);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: 'Server error'
        });
    }
};