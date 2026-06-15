const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const authenticate = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');

// Customer routes
router.post('/', authenticate, ctrl.createOrder);
router.get('/', authenticate, ctrl.getOrders);
router.get('/:id', authenticate, ctrl.getOrderDetail);
router.patch('/:id/cancel', authenticate, ctrl.cancelOrder);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, ctrl.getAllOrders);
router.patch('/admin/:id/status', authenticate, isAdmin, ctrl.updateOrderStatus);

module.exports = router;
