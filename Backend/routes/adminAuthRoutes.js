const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminAuthController');
const { requireAdmin } = require('../middleware/auth');

router.post('/admin/auth/login',  ctrl.login);
router.get('/admin/auth/verify',  requireAdmin, ctrl.verify);

module.exports = router;
