const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
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
  action_type: {
    type: DataTypes.ENUM('access_granted', 'access_revoked', 'data_viewed', 'data_uploaded', 'profile_updated', 'login'),
    allowNull: false
  },
  actor_type: {
    type: DataTypes.ENUM('user', 'hospital', 'system'),
    allowNull: false
  },
  actor_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hospital_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'hospitals',
      key: 'id'
    }
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'audit_logs',
  timestamps: false
});

module.exports = AuditLog;
