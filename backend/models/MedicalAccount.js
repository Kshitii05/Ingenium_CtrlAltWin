const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const MedicalAccount = sequelize.define('MedicalAccount', {
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
  medical_id: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  chronic_conditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  current_medications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergency_contact_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  blood_group: {
    type: DataTypes.STRING(5),
    allowNull: true
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
  tableName: 'medical_accounts',
  timestamps: false
});

// Generate medical ID before creating
MedicalAccount.beforeCreate(async (account) => {
  account.medical_id = `MED-USR-${uuidv4().substring(0, 8).toUpperCase()}`;
  if (account.password_hash) {
    account.password_hash = await bcrypt.hash(account.password_hash, 10);
  }
});

MedicalAccount.beforeUpdate(async (account) => {
  if (account.changed('password_hash')) {
    account.password_hash = await bcrypt.hash(account.password_hash, 10);
  }
});

MedicalAccount.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = MedicalAccount;
