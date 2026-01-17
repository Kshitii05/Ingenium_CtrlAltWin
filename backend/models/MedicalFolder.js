const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalFolder = sequelize.define('MedicalFolder', {
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
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'medical_folders',
      key: 'id'
    }
  },
  folder_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('records', 'bills', 'profile'),
    allowNull: false,
    defaultValue: 'records',
    comment: 'Section where folder belongs: records, bills, or profile'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'medical_folders',
  timestamps: false
});

module.exports = MedicalFolder;
