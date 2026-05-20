const FlightSegment = require('../models/FlightSegment');
const { getDb } = require('../db/database');

// Sync a single row into flight_segments_copy after insert/update
function syncCopy(segmentId) {
    const db  = getDb();
    const row = db.prepare('SELECT * FROM flight_segments WHERE segment_id = ?').get(segmentId);
    if (!row) return;
    db.prepare(`
        INSERT OR REPLACE INTO flight_segments_copy
            (segment_id, origin_code, destination_code, distance_km, duration_min, base_cost_usd, airline_code, aircraft_code, copied_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(row.segment_id, row.origin_code, row.destination_code, row.distance_km, row.duration_min, row.base_cost_usd, row.airline_code, row.aircraft_code);
}

// Remove a row from copy on delete
function removeCopy(segmentId) {
    getDb().prepare('DELETE FROM flight_segments_copy WHERE segment_id = ?').run(segmentId);
}

const flightController = {
    getAllFlights(req, res) {
        try {
            const flights = FlightSegment.getAll();
            res.json({ flights, total: flights.length });
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

            if (!segment_id || !origin_code || !destination_code || !distance_km || !duration_min || !base_cost_usd || !airline_code || !aircraft_code) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            FlightSegment.insert({ segment_id, origin_code, destination_code, distance_km: Number(distance_km), duration_min: Number(duration_min), base_cost_usd: Number(base_cost_usd), airline_code, aircraft_code });
            syncCopy(segment_id);
            const created = FlightSegment.getById(segment_id);
            res.status(201).json({ message: 'Flight created successfully', flight: created });
        } catch (err) {
            if (err.message && err.message.includes('UNIQUE')) {
                return res.status(409).json({ error: `Segment ID '${req.body.segment_id}' already exists` });
            }
            res.status(500).json({ error: err.message });
        }
    },

    updateFlight(req, res) {
        try {
            const { origin_code, destination_code, distance_km, duration_min, base_cost_usd, airline_code, aircraft_code } = req.body;
            const info = FlightSegment.update(req.params.id, {
                origin_code, destination_code,
                distance_km: Number(distance_km), duration_min: Number(duration_min),
                base_cost_usd: Number(base_cost_usd), airline_code, aircraft_code,
            });
            if (info.changes === 0) return res.status(404).json({ error: 'Flight not found' });
            syncCopy(req.params.id);
            const updated = FlightSegment.getById(req.params.id);
            res.json({ message: 'Flight updated successfully', flight: updated });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteFlight(req, res) {
        try {
            const info = FlightSegment.delete(req.params.id);
            if (info.changes === 0) return res.status(404).json({ error: 'Flight not found' });
            removeCopy(req.params.id);
            res.json({ message: 'Flight deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = flightController;
