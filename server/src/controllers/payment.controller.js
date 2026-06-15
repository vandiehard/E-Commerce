const crypto = require('crypto');
const sequelize = require('../config/database');
const { Order, OrderItem, Product, Payment } = require('../models');
const { success, error } = require('../utils/response');

const handleNotification = async (req, res, next) => {
  try {
    const notification = req.body;

    // Verify Midtrans signature
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    const signatureString = orderId + statusCode + grossAmount + serverKey;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(signatureString)
      .digest('base64');

    if (expectedSignature !== notification.signature_value) {
      return error(res, 'Invalid signature', 403);
    }

    // Find payment by midtrans order id
    const payment = await Payment.findOne({
      where: { midtrans_order_id: orderId },
    });

    if (!payment) {
      return error(res, 'Payment not found', 404);
    }

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type;

    const t = await sequelize.transaction();

    try {
      let orderStatus;
      let paymentStatus;

      if (transactionStatus === 'capture') {
        if (fraudStatus === 'challenge') {
          paymentStatus = 'pending';
          orderStatus = 'pending';
        } else if (fraudStatus === 'accept') {
          paymentStatus = 'success';
          orderStatus = 'paid';
        }
      } else if (transactionStatus === 'settlement') {
        paymentStatus = 'success';
        orderStatus = 'paid';
      } else if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
        paymentStatus = 'failed';
        orderStatus = 'cancelled';
      } else if (transactionStatus === 'expire') {
        paymentStatus = 'expired';
        orderStatus = 'cancelled';
      } else if (transactionStatus === 'pending') {
        paymentStatus = 'pending';
        orderStatus = 'pending';
      }

      // Update payment
      payment.status = paymentStatus;
      payment.method = paymentType;
      if (paymentStatus === 'success') {
        payment.paid_at = new Date();
      }
      await payment.save({ transaction: t });

      // Update order
      const order = await Order.findByPk(payment.order_id, {
        include: [{ model: OrderItem, as: 'items' }],
        transaction: t,
      });

      if (order) {
        order.status = orderStatus;
        order.payment_status = paymentStatus;
        await order.save({ transaction: t });

        // Restore stock if payment failed/expired
        if (orderStatus === 'cancelled' && paymentStatus !== 'success') {
          for (const item of order.items) {
            await Product.update(
              { stock: sequelize.literal(`stock + ${item.quantity}`) },
              { where: { id: item.product_id }, transaction: t }
            );
          }
        }
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }

    return success(res, null, 'Notification processed');
  } catch (err) {
    next(err);
  }
};

const generateToken = async (req, res, next) => {
  try {
    const { order_id } = req.body;
    const order = await Order.findOne({
      where: { id: order_id, user_id: req.user.id },
    });

    if (!order) return error(res, 'Order not found', 404);
    if (!order.snap_token) return error(res, 'Snap token not available', 400);

    return success(res, { snap_token: order.snap_token });
  } catch (err) {
    next(err);
  }
};

module.exports = { handleNotification, generateToken };
