const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const GovernmentUser = sequelize.define('GovernmentUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  officer_id: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
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
  department: {
    type: DataTypes.ENUM('health', 'agriculture', 'revenue', 'welfare'),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('officer', 'senior_officer', 'admin'),
    defaultValue: 'officer'
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false
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
  tableName: 'government_users',
  timestamps: false
});

GovernmentUser.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

GovernmentUser.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

GovernmentUser.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = GovernmentUser;
