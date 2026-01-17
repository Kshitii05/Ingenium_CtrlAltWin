const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalBill = sequelize.define('MedicalBill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  medical_account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medical_accounts',
      key: 'id'
    }
  },
  hospital_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hospitals',
      key: 'id'
    }
  },
  bill_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  bill_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  insurance_claimed: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'claimed'),
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'medical_bills',
  timestamps: false
});

module.exports = MedicalBill;
