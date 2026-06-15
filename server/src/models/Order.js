const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  address_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  shipping_method: {
    type: DataTypes.STRING(50),
    defaultValue: null,
  },
  shipping_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'expired'),
    allowNull: false,
    defaultValue: 'pending',
  },
  snap_token: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
}, {
  tableName: 'orders',
});

module.exports = Order;
