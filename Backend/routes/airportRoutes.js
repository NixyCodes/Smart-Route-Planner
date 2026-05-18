const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/airportController');

router.get('/airports',          ctrl.getAirports);
router.get('/airports/:code',    ctrl.getAirport);
router.get('/segments',          ctrl.getSegments);
router.get('/stats',             ctrl.getStats);
router.get('/routes/history',    ctrl.getRouteHistory);

module.exports = router;
