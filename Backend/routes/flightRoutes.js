const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/flightController');
const { requireAdmin } = require('../middleware/auth');

// Public: list all flights (used by route planner indirectly via /segments)
router.get('/admin/flights',       requireAdmin, ctrl.getAllFlights);
router.get('/admin/flights/:id',   requireAdmin, ctrl.getFlightById);
router.post('/admin/flights',      requireAdmin, ctrl.createFlight);
router.put('/admin/flights/:id',   requireAdmin, ctrl.updateFlight);
router.delete('/admin/flights/:id',requireAdmin, ctrl.deleteFlight);

module.exports = router;
