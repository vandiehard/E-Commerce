const sequelize = require('../config/database');
const snap = require('../config/midtrans');
const { Cart, CartItem, Product, Order, OrderItem, Payment, Address } = require('../models');
const { success, error } = require('../utils/response');

const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { address_id, shipping_method = 'regular', shipping_cost = 0, notes } = req.body;

    // Validate address
    const address = await Address.findOne({
      where: { id: address_id, user_id: req.user.id },
    });
    if (!address) {
      await t.rollback();
      return error(res, 'Address not found', 404);
    }

    // Get cart items
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }],
      }],
    });

    if (!cart || cart.items.length === 0) {
      await t.rollback();
      return error(res, 'Cart is empty', 400);
    }

    // Calculate total and validate stock
    let itemsTotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        await t.rollback();
        return error(res, 'A product in your cart no longer exists', 400);
      }
      if (item.product.stock < item.quantity) {
        await t.rollback();
        return error(res, `Insufficient stock for ${item.product.name}`, 400);
      }
      if (item.product.status !== 'active') {
        await t.rollback();
        return error(res, `${item.product.name} is no longer available`, 400);
      }

      itemsTotal += parseFloat(item.product.price) * item.quantity;
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    const total = itemsTotal + parseFloat(shipping_cost);

    // Deduct stock
    for (const item of cart.items) {
      await Product.update(
        { stock: sequelize.literal(`stock - ${item.quantity}`) },
        { where: { id: item.product_id }, transaction: t }
      );
    }

    // Create order
    const order = await Order.create({
      user_id: req.user.id,
      address_id,
      total,
      shipping_method,
      shipping_cost,
      notes,
      status: 'pending',
      payment_status: 'pending',
    }, { transaction: t });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...item,
      }, { transaction: t });
    }

    // Generate Midtrans Snap token
    const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;
    const snapParams = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(total),
      },
      customer_details: {
        first_name: req.user.email.split('@')[0],
        email: req.user.email,
      },
      item_details: cart.items.map((item) => ({
        id: item.product_id,
        price: Math.round(parseFloat(item.product.price)),
        quantity: item.quantity,
        name: item.product.name.substring(0, 50),
      })),
    };

    let snapToken;
    try {
      const snapResponse = await snap.createTransaction(snapParams);
      snapToken = snapResponse.token;
    } catch (midtransErr) {
      console.error('Midtrans error:', midtransErr);
      snapToken = null; // Allow order creation even if Midtrans fails (sandbox)
    }

    // Update order with snap token
    order.snap_token = snapToken;
    await order.save({ transaction: t });

    // Create payment record
    await Payment.create({
      order_id: order.id,
      midtrans_order_id: midtransOrderId,
      status: 'pending',
    }, { transaction: t });

    // Clear cart
    await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

    await t.commit();

    // Return order with snap token for frontend
    return success(res, {
      ...order.toJSON(),
      items: orderItems,
      address,
      snap_token: snapToken,
    }, 'Order created successfully');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'images'],
          }],
        },
        { model: Address, as: 'address' },
        { model: Payment, as: 'payment', attributes: ['status', 'method', 'paid_at'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const totalPages = Math.ceil(orders.count / parseInt(limit));
    return res.status(200).json({
      success: true,
      message: 'Success',
      data: orders.rows,
      pagination: {
        totalItems: orders.count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'price', 'images'],
          }],
        },
        { model: Address, as: 'address' },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!order) {
      return error(res, 'Order not found', 404);
    }

    return success(res, order);
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return error(res, 'Order not found', 404);
    }

    if (order.status !== 'pending') {
      await t.rollback();
      return error(res, 'Only pending orders can be cancelled', 400);
    }

    // Restore stock
    for (const item of order.items) {
      await Product.update(
        { stock: sequelize.literal(`stock + ${item.quantity}`) },
        { where: { id: item.product_id }, transaction: t }
      );
    }

    order.status = 'cancelled';
    order.payment_status = 'failed';
    await order.save({ transaction: t });

    // Update payment status
    await Payment.update(
      { status: 'failed' },
      { where: { order_id: order.id }, transaction: t }
    );

    await t.commit();
    return success(res, order, 'Order cancelled');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// Admin endpoints
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, payment_status, start_date, end_date } = req.query;
    const where = {};
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;
    if (start_date && end_date) {
      const { Op } = require('sequelize');
      where.created_at = { [Op.between]: [start_date, end_date] };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'slug'] }],
        },
        { model: Address, as: 'address' },
        { model: Payment, as: 'payment' },
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const totalPages = Math.ceil(orders.count / parseInt(limit));
    return res.status(200).json({
      success: true,
      data: orders.rows,
      pagination: {
        totalItems: orders.count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, tracking_number } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) return error(res, 'Order not found', 404);

    const validTransitions = {
      pending: ['paid', 'cancelled'],
      paid: ['processing', 'cancelled'],
      processing: ['shipped'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return error(res, `Cannot transition from ${order.status} to ${status}`, 400);
    }

    order.status = status;
    if (tracking_number) order.tracking_number = tracking_number;

    if (status === 'paid') {
      order.payment_status = 'success';
    }

    await order.save();
    return success(res, order, 'Order status updated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderDetail,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
