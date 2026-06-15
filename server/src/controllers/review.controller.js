const { Review, Order, OrderItem, User } = require('../models');
const { Op } = require('sequelize');
const { success, created, error, paginate } = require('../utils/response');
const { body } = require('express-validator');

const reviewValidation = [
  body('product_id').isInt().withMessage('Product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
];

const createReview = async (req, res, next) => {
  try {
    const { product_id, rating, comment } = req.body;

    // Check if user has a delivered order containing this product
    const deliveredOrder = await Order.findOne({
      where: {
        user_id: req.user.id,
        status: 'delivered',
      },
      include: [{
        model: OrderItem,
        as: 'items',
        where: { product_id },
      }],
    });

    if (!deliveredOrder) {
      return error(res, 'You can only review products from delivered orders', 400);
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      where: { user_id: req.user.id, product_id },
    });

    if (existingReview) {
      return error(res, 'You have already reviewed this product', 409);
    }

    const review = await Review.create({
      user_id: req.user.id,
      product_id,
      rating,
      comment,
    });

    return created(res, review, 'Review created');
  } catch (err) {
    next(err);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.findAndCountAll({
      where: { product_id: req.params.productId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return paginate(res, {
      rows: reviews.rows,
      count: reviews.count,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!review) return error(res, 'Review not found', 404);

    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    return success(res, review, 'Review updated');
  } catch (err) {
    next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    // Users can delete own reviews, admins can delete any
    const where = { id: req.params.id };
    if (req.user.role !== 'admin') {
      where.user_id = req.user.id;
    }

    const review = await Review.findOne({ where });
    if (!review) return error(res, 'Review not found', 404);

    await review.destroy();
    return success(res, null, 'Review deleted');
  } catch (err) {
    next(err);
  }
};

const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.findAndCountAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: require('../models').Product,
          as: 'product',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return paginate(res, {
      rows: reviews.rows,
      count: reviews.count,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  reviewValidation,
};
