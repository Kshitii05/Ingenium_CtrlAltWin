const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const Hospital = sequelize.define('Hospital', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hospital_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  hospital_unique_id: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    comment: 'Hospital Unique ID for login (replaces registration_number)'
  },
  facility_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Health Facility Registry ID'
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
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  specializations: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of specializations'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'hospitals',
  timestamps: false
});

Hospital.beforeCreate(async (hospital) => {
  if (hospital.password_hash) {
    hospital.password_hash = await bcrypt.hash(hospital.password_hash, 10);
  }
});

Hospital.beforeUpdate(async (hospital) => {
  if (hospital.changed('password_hash')) {
    hospital.password_hash = await bcrypt.hash(hospital.password_hash, 10);
  }
});

Hospital.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = Hospital;
