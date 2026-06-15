const sequelize = require('../config/database');
const { User, Order, Product, OrderItem } = require('../models');
const { success, error } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const totalRevenue = await Order.sum('total', {
      where: { payment_status: 'success' },
    });

    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    const totalUsers = await User.count({ where: { role: 'customer' } });

    const recentOrders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name'] }],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    // Monthly revenue (last 12 months)
    const monthlyRevenue = await sequelize.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS total_orders,
        SUM(total) AS revenue
      FROM orders
      WHERE payment_status = 'success'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `, { type: sequelize.QueryTypes.SELECT });

    return success(res, {
      stats: {
        totalRevenue: totalRevenue || 0,
        totalOrders,
        totalProducts,
        totalUsers,
      },
      recentOrders,
      monthlyRevenue,
    });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const totalPages = Math.ceil(users.count / parseInt(limit));
    return res.status(200).json({
      success: true,
      data: users.rows,
      pagination: {
        totalItems: users.count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    user.is_active = !user.is_active;
    await user.save();

    return success(res, {
      id: user.id,
      name: user.name,
      is_active: user.is_active,
    }, `User ${user.is_active ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
};

const exportOrdersCSV = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Generate CSV
    let csv = 'Order ID,Date,Customer,Email,Status,Payment Status,Total,Items\n';
    for (const order of orders) {
      const items = order.items.map((i) => `${i.product?.name || 'N/A'} x${i.quantity}`).join('; ');
      csv += `${order.id},"${order.created_at}","${order.user?.name || ''}","${order.user?.email || ''}",${order.status},${order.payment_status},${order.total},"${items}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getUsers, toggleUserActive, exportOrdersCSV };
