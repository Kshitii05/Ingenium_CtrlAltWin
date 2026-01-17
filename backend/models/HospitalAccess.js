const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HospitalAccess = sequelize.define('HospitalAccess', {
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
  access_scope: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of scopes: profile, records, bills, insurance'
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Object with read/upload permissions per scope'
  },
  granted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'hospital_access',
  timestamps: false
});

module.exports = HospitalAccess;
