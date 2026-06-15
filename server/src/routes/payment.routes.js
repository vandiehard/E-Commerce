const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const authenticate = require('../middleware/auth.middleware');

// Public webhook (no auth - Midtrans calls this)
router.post('/notification', ctrl.handleNotification);

// Authenticated
router.post('/token', authenticate, ctrl.generateToken);

module.exports = router;
