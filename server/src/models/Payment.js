const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
  },
  midtrans_order_id: {
    type: DataTypes.STRING(100),
    defaultValue: null,
  },
  method: {
    type: DataTypes.STRING(50),
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'expired'),
    allowNull: false,
    defaultValue: 'pending',
  },
  paid_at: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
}, {
  tableName: 'payments',
});

module.exports = Payment;
