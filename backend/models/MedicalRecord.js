const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
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
  record_type: {
    type: DataTypes.ENUM('lab_report', 'prescription', 'diagnosis', 'scan', 'other'),
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
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  uploaded_by_type: {
    type: DataTypes.ENUM('user', 'hospital'),
    allowNull: false
  },
  uploaded_by_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  hospital_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'hospitals',
      key: 'id'
    }
  },
  record_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_immutable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'medical_records',
  timestamps: false
});

module.exports = MedicalRecord;
