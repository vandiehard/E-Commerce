const router = require('express').Router();
const ctrl = require('../controllers/cart.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, ctrl.getCart);
router.post('/items', authenticate, ctrl.addToCart);
router.put('/items/:id', authenticate, ctrl.updateCartItem);
router.delete('/items/:id', authenticate, ctrl.removeCartItem);
router.delete('/', authenticate, ctrl.clearCart);

module.exports = router;
