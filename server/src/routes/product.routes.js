const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const validate = require('../middleware/validate.middleware');
const authenticate = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', ctrl.getProducts);
router.get('/categories', ctrl.getCategories);
router.get('/:slug', ctrl.getProductBySlug);

// Admin routes
router.post('/', authenticate, isAdmin, upload.array('images', 5), ctrl.createProduct);
router.put('/:id', authenticate, isAdmin, upload.array('images', 5), ctrl.updateProduct);
router.delete('/:id', authenticate, isAdmin, ctrl.deleteProduct);
router.post('/categories', authenticate, isAdmin, ctrl.createCategory);
router.put('/categories/:id', authenticate, isAdmin, ctrl.updateCategory);
router.delete('/categories/:id', authenticate, isAdmin, ctrl.deleteCategory);

module.exports = router;
