const router = require('express').Router();
const ctrl = require('../controllers/review.controller');
const validate = require('../middleware/validate.middleware');
const authenticate = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');

router.post('/', authenticate, ctrl.reviewValidation, validate, ctrl.createReview);
router.get('/product/:productId', ctrl.getProductReviews);
router.put('/:id', authenticate, ctrl.updateReview);
router.delete('/:id', authenticate, ctrl.deleteReview);
router.get('/admin/all', authenticate, isAdmin, ctrl.getAllReviews);

module.exports = router;
