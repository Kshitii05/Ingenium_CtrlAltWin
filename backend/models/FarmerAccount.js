const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const FarmerAccount = sequelize.define('FarmerAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Optional link to user account for existing users'
  },
  kyc_id: {
    type: DataTypes.STRING(30),
    unique: true,
    allowNull: false,
    comment: 'Format: FRM-STATE-YEAR-XXXXXX'
  },
  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  // Identity & Contact
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  aadhaar: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true
  },
  mobile: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // Agricultural Details
  land_ownership: {
    type: DataTypes.ENUM('own', 'lease', 'sharecropper', 'tenant', 'other'),
    allowNull: true
  },
  land_area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'In acres'
  },
  village: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  taluka: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(6),
    allowNull: true
  },
  crop_type: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  irrigation_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  storage_capacity: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Financial Details
  bank_account: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  bank_ifsc: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  bank_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  kcc_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Kisan Credit Card Number'
  },
  farmer_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Existing Farmer ID if any'
  },
  // Status
  kyc_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
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
  tableName: 'farmer_accounts',
  timestamps: false
});

// Generate KYC ID before validation (Format: FRM-STATE-YEAR-XXXXXX)
FarmerAccount.addHook('beforeValidate', (account) => {
  if (!account.kyc_id && account.state) {
    const { v4: uuidv4 } = require('uuid');
    const stateCode = account.state.substring(0, 2).toUpperCase();
    const year = new Date().getFullYear();
    const randomId = uuidv4().substring(0, 6).toUpperCase();
    account.kyc_id = `FRM-${stateCode}-${year}-${randomId}`;
  }
});

// Hash password before creation
FarmerAccount.addHook('beforeCreate', async (account) => {
  if (account.password_hash && !account.password_hash.startsWith('$2b$')) {
    account.password_hash = await bcrypt.hash(account.password_hash, 10);
  }
});

// Hash password before update
FarmerAccount.addHook('beforeUpdate', async (account) => {
  if (account.changed('password_hash') && !account.password_hash.startsWith('$2b$')) {
    account.password_hash = await bcrypt.hash(account.password_hash, 10);
  }
});

// Instance method to compare passwords
FarmerAccount.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = FarmerAccount;
