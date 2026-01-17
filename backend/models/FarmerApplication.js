const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FarmerApplication = sequelize.define('FarmerApplication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  farmer_account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'farmer_accounts',
      key: 'id'
    }
  },
  application_type: {
    type: DataTypes.ENUM('subsidy', 'loan', 'scheme', 'certification'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'rejected'),
    defaultValue: 'submitted'
  },
  government_reply: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'government_users',
      key: 'id'
    }
  }
}, {
  tableName: 'farmer_applications',
  timestamps: false
});

module.exports = FarmerApplication;
