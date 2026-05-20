const express = require('express');
const router  = express.Router();
const { getShortestPath, compareRoutes } = require('../controllers/pathController');

router.post('/shortest-path', getShortestPath);
router.post('/compare',       compareRoutes);

module.exports = router;
