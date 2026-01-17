const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FarmerAccount = sequelize.define('FarmerAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  farmer_id: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  land_area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'In acres'
  },
  land_location: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  crop_types: {
    type: DataTypes.JSON,
    allowNull: true
  },
  bank_account: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bank_ifsc: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  kyc_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'farmer_accounts',
  timestamps: false
});

module.exports = FarmerAccount;
