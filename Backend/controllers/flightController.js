const FlightSegment = require('../models/FlightSegment');

const flightController = {
    getAllFlights(req, res) {
        try {
            const flights = FlightSegment.getAll();
            res.json(flights);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getFlightById(req, res) {
        try {
            const flight = FlightSegment.getById(req.params.id);
            if (!flight) return res.status(404).json({ error: 'Flight not found' });
            res.json(flight);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    createFlight(req, res) {
        try {
            const { segment_id, origin_code, destination_code, distance_km, duration_min, base_cost_usd, airline_code, aircraft_code } = req.body;
            FlightSegment.insert({ segment_id, origin_code, destination_code, distance_km, duration_min, base_cost_usd, airline_code, aircraft_code });
            res.status(201).json({ message: 'Flight created successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    updateFlight(req, res) {
        try {
            const { origin_code, destination_code, distance_km, duration_min, base_cost_usd, airline_code, aircraft_code } = req.body;
            const info = FlightSegment.update(req.params.id, { origin_code, destination_code, distance_km, duration_min, base_cost_usd, airline_code, aircraft_code });
            if (info.changes === 0) return res.status(404).json({ error: 'Flight not found' });
            res.json({ message: 'Flight updated successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteFlight(req, res) {
        try {
            const info = FlightSegment.delete(req.params.id);
            if (info.changes === 0) return res.status(404).json({ error: 'Flight not found' });
            res.json({ message: 'Flight deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = flightController;
