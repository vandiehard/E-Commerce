const router = require('express').Router();
const ctrl = require('../controllers/address.controller');
const validate = require('../middleware/validate.middleware');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getAddresses);
router.post('/', ctrl.addressValidation, validate, ctrl.createAddress);
router.put('/:id', ctrl.updateAddress);
router.delete('/:id', ctrl.deleteAddress);

module.exports = router;
