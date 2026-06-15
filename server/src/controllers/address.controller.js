const { Address } = require('../models');
const { success, created, error } = require('../utils/response');
const { body } = require('express-validator');

const addressValidation = [
  body('label').trim().notEmpty().withMessage('Label is required'),
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('province').trim().notEmpty().withMessage('Province is required'),
  body('postal_code').trim().notEmpty().withMessage('Postal code is required'),
];

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.findAll({
      where: { user_id: req.user.id },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']],
    });
    return success(res, addresses);
  } catch (err) {
    next(err);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const { label, street, city, province, postal_code, is_default } = req.body;

    // If setting as default, unset others
    if (is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: req.user.id } }
      );
    }

    const address = await Address.create({
      user_id: req.user.id,
      label,
      street,
      city,
      province,
      postal_code,
      is_default: is_default || false,
    });

    return created(res, address, 'Address created');
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!address) return error(res, 'Address not found', 404);

    const { label, street, city, province, postal_code, is_default } = req.body;

    if (is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: req.user.id } }
      );
    }

    if (label) address.label = label;
    if (street) address.street = street;
    if (city) address.city = city;
    if (province) address.province = province;
    if (postal_code) address.postal_code = postal_code;
    if (is_default !== undefined) address.is_default = is_default;

    await address.save();
    return success(res, address, 'Address updated');
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!address) return error(res, 'Address not found', 404);

    await address.destroy();
    return success(res, null, 'Address deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  addressValidation,
};
