const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');

router.use(authenticate, isAdmin);
router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getUsers);
router.patch('/users/:id/toggle-active', ctrl.toggleUserActive);
router.get('/orders/export', ctrl.exportOrdersCSV);

module.exports = router;
