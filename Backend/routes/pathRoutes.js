const express = require('express');

const router = express.Router();

const {
    getShortestPath
} = require('../controllers/pathController');

router.post('/shortest-path', getShortestPath);

module.exports = router;