const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalFile = sequelize.define('MedicalFile', {
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
  folder_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'medical_folders',
      key: 'id'
    }
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    comment: 'File size in bytes'
  },
  uploaded_by: {
    type: DataTypes.ENUM('user', 'hospital'),
    allowNull: false,
    defaultValue: 'user'
  },
  uploaded_by_id: {
    type: DataTypes.INTEGER,
    comment: 'ID of user or hospital who uploaded'
  },
  is_immutable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Files cannot be edited once uploaded'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'medical_files',
  timestamps: false
});

module.exports = MedicalFile;
