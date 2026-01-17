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
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: true
  },
  blood_group: {
    type: DataTypes.STRING(5),
    allowNull: true
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
  past_surgeries: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  disabilities: {
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
  emergency_contact_relation: {
    type: DataTypes.STRING(100),
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

// Hooks must be defined with specific hook options
MedicalAccount.addHook('beforeValidate', async (account) => {
  // Generate medical ID if not exists
  if (!account.medical_id) {
    account.medical_id = `MED-USR-${uuidv4().substring(0, 8).toUpperCase()}`;
  }
});

MedicalAccount.addHook('beforeCreate', async (account) => {
  // Hash password if provided
  if (account.password_hash && !account.password_hash.startsWith('$2b$')) {
    account.password_hash = await bcrypt.hash(account.password_hash, 10);
  }
});

MedicalAccount.addHook('beforeUpdate', async (account) => {
  // Hash password if changed
  if (account.changed('password_hash') && !account.password_hash.startsWith('$2b$')) {
    account.password_hash = await bcrypt.hash(account.password_hash, 10);
  }
});

// Instance method to compare passwords
MedicalAccount.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = MedicalAccount;
