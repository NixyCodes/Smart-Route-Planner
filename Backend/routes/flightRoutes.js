const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

router.get('/admin/flights', flightController.getAllFlights);
router.get('/admin/flights/:id', flightController.getFlightById);
router.post('/admin/flights', flightController.createFlight);
router.put('/admin/flights/:id', flightController.updateFlight);
router.delete('/admin/flights/:id', flightController.deleteFlight);

module.exports = router;
