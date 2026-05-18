const Airport        = require('../models/Airport');
const FlightSegment  = require('../models/FlightSegment');
const OptimizedRoute = require('../models/OptimizedRoute');

exports.getAirports = (req, res) => {
    try {
        const airports = Airport.getAll();
        return res.json({ airports });
    } catch (err) {
        console.error('[airportController.getAirports]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAirport = (req, res) => {
    try {
        const airport = Airport.getByCode(req.params.code.toUpperCase());
        if (!airport) return res.status(404).json({ error: 'Airport not found' });
        return res.json({ airport });
    } catch (err) {
        console.error('[airportController.getAirport]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getSegments = (req, res) => {
    try {
        // Return minimal edge list for frontend map rendering
        const segments = FlightSegment.getEdgeList();
        return res.json({ segments });
    } catch (err) {
        console.error('[airportController.getSegments]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getStats = (req, res) => {
    try {
        const network      = Airport.getStats();
        const topAirports  = Airport.getMostConnected(8);
        const airlineStats = FlightSegment.getAirlineStats();
        const routeStats   = OptimizedRoute.getSummaryStats();
        return res.json({ network, topAirports, airlineStats, routeStats });
    } catch (err) {
        console.error('[airportController.getStats]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getRouteHistory = (req, res) => {
    try {
        const limit  = Math.min(parseInt(req.query.limit) || 15, 50);
        const routes = OptimizedRoute.getHistory(limit);
        return res.json({ routes });
    } catch (err) {
        console.error('[airportController.getRouteHistory]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
