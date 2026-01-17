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
  category: {
    type: DataTypes.ENUM('records', 'bills', 'profile'),
    allowNull: false,
    defaultValue: 'records',
    comment: 'Section where file belongs: records, bills, or profile'
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
  hospital_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'hospitals',
      key: 'id'
    },
    comment: 'Foreign key to hospitals table if uploaded by hospital'
  },
  hospital_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Hospital name for display purposes'
  },
  document_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Title of the document'
  },
  document_type: {
    type: DataTypes.ENUM('Report', 'Prescription', 'Bill', 'Summary', 'Lab Report', 'Imaging', 'Other'),
    allowNull: true,
    comment: 'Type of medical document'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes or description'
  },
  visibility_to_hospital: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether hospitals can view this file (for patient uploads)'
  },
  visibility_to_patient: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether patient can view this file (always true for hospital uploads)'
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
