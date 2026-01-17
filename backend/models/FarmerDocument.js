const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FarmerDocument = sequelize.define('FarmerDocument', {
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
  document_type: {
    type: DataTypes.ENUM('land_record', 'kyc_document', 'bank_proof', 'other'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'farmer_documents',
  timestamps: false
});

module.exports = FarmerDocument;
