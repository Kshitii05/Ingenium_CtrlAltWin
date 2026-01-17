const { MedicalAccount, User, HospitalAccess, MedicalRecord, MedicalBill, AuditLog, Hospital } = require('../models');
const { sendOTP, verifyOTP } = require('../utils/otp');
const { generateToken } = require('../utils/jwt');
const { Op } = require('sequelize');

// Check Medical Account Status
exports.checkAccountStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const medicalAccount = await MedicalAccount.findOne({
      where: { user_id: userId }
    });

    res.json({
      success: true,
      exists: !!medicalAccount,
      account: medicalAccount ? {
        id: medicalAccount.id,
        medical_id: medicalAccount.medical_id,
        email: medicalAccount.email
      } : null
    });
  } catch (error) {
    console.error('Check account status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check account status'
    });
  }
};

// Initiate Medical Account Creation (Send OTP)
exports.initiateAccountCreation = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = req.user.id;

    // Check if account already exists
    const existingAccount = await MedicalAccount.findOne({
      where: { user_id: userId }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Medical account already exists'
      });
    }

    // Check if email is already used
    const existingEmail = await MedicalAccount.findOne({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Send OTP
    await sendOTP(email, 'medical_account_creation');

    res.json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('Initiate account creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Verify OTP and Create Medical Account
exports.createMedicalAccount = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const userId = req.user.id;

    // Verify OTP
    const otpVerification = await verifyOTP(email, otp, 'medical_account_creation');
    if (!otpVerification.success) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      });
    }

    // Get user details
    const user = await User.findByPk(userId);

    // Create medical account
    const medicalAccount = await MedicalAccount.create({
      user_id: userId,
      email,
      password_hash: password
    });

    // Create audit log
    await AuditLog.create({
      medical_account_id: medicalAccount.id,
      action_type: 'login',
      actor_type: 'user',
      actor_id: userId,
      details: { action: 'Account created' }
    });

    res.status(201).json({
      success: true,
      message: 'Medical account created successfully',
      account: {
        id: medicalAccount.id,
        medical_id: medicalAccount.medical_id,
        email: medicalAccount.email
      }
    });
  } catch (error) {
    console.error('Create medical account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medical account'
    });
  }
};

// Medical Account Login
exports.medicalLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const medicalAccount = await MedicalAccount.findOne({
      where: { email },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'dob', 'gender', 'phone']
      }]
    });

    if (!medicalAccount) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await medicalAccount.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create audit log
    await AuditLog.create({
      medical_account_id: medicalAccount.id,
      action_type: 'login',
      actor_type: 'user',
      actor_id: medicalAccount.user_id,
      details: { action: 'Medical login' }
    });

    const token = generateToken({
      id: medicalAccount.id,
      user_id: medicalAccount.user_id,
      medical_id: medicalAccount.medical_id,
      email: medicalAccount.email,
      type: 'medical_user'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      account: {
        id: medicalAccount.id,
        medical_id: medicalAccount.medical_id,
        email: medicalAccount.email,
        user: medicalAccount.user
      }
    });
  } catch (error) {
    console.error('Medical login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get Medical Profile
exports.getMedicalProfile = async (req, res) => {
  try {
    const medicalAccountId = req.user.id;

    const medicalAccount = await MedicalAccount.findByPk(medicalAccountId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'dob', 'gender', 'phone', 'address', 'aadhaar_number']
      }]
    });

    if (!medicalAccount) {
      return res.status(404).json({
        success: false,
        message: 'Medical account not found'
      });
    }

    res.json({
      success: true,
      profile: {
        medical_id: medicalAccount.medical_id,
        email: medicalAccount.email,
        allergies: medicalAccount.allergies,
        chronic_conditions: medicalAccount.chronic_conditions,
        current_medications: medicalAccount.current_medications,
        emergency_contact_name: medicalAccount.emergency_contact_name,
        emergency_contact_phone: medicalAccount.emergency_contact_phone,
        blood_group: medicalAccount.blood_group,
        user: medicalAccount.user
      }
    });
  } catch (error) {
    console.error('Get medical profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update Medical Profile
exports.updateMedicalProfile = async (req, res) => {
  try {
    const medicalAccountId = req.user.id;
    const {
      allergies,
      chronic_conditions,
      current_medications,
      emergency_contact_name,
      emergency_contact_phone,
      blood_group
    } = req.body;

    const medicalAccount = await MedicalAccount.findByPk(medicalAccountId);
    if (!medicalAccount) {
      return res.status(404).json({
        success: false,
        message: 'Medical account not found'
      });
    }

    await medicalAccount.update({
      allergies,
      chronic_conditions,
      current_medications,
      emergency_contact_name,
      emergency_contact_phone,
      blood_group
    });

    // Create audit log
    await AuditLog.create({
      medical_account_id: medicalAccountId,
      action_type: 'profile_updated',
      actor_type: 'user',
      actor_id: req.user.user_id,
      details: { updated_fields: Object.keys(req.body) }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update medical profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Grant Hospital Access
exports.grantHospitalAccess = async (req, res) => {
  try {
    const medicalAccountId = req.user.id;
    const { hospital_id, access_scope, permissions, duration_days } = req.body;

    // Check if hospital exists
    const hospital = await Hospital.findByPk(hospital_id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration_days);

    // Create access
    const hospitalAccess = await HospitalAccess.create({
      medical_account_id: medicalAccountId,
      hospital_id,
      access_scope,
      permissions,
      expires_at: expiresAt
    });

    // Create audit log
    await AuditLog.create({
      medical_account_id: medicalAccountId,
      action_type: 'access_granted',
      actor_type: 'user',
      actor_id: req.user.user_id,
      hospital_id,
      details: { access_scope, permissions, duration_days }
    });

    res.status(201).json({
      success: true,
      message: 'Hospital access granted successfully',
      access: hospitalAccess
    });
  } catch (error) {
    console.error('Grant hospital access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grant access'
    });
  }
};

// Get Active Hospital Access
exports.getActiveAccess = async (req, res) => {
  try {
    const medicalAccountId = req.user.id;

    const activeAccess = await HospitalAccess.findAll({
      where: {
        medical_account_id: medicalAccountId,
        is_active: true,
        expires_at: {
          [Op.gt]: new Date()
        }
      },
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'hospital_name', 'email', 'phone']
      }],
      order: [['granted_at', 'DESC']]
    });

    res.json({
      success: true,
      access: activeAccess
    });
  } catch (error) {
    console.error('Get active access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access list'
    });
  }
};

// Revoke Hospital Access
exports.revokeHospitalAccess = async (req, res) => {
  try {
    const medicalAccountId = req.user.id;
    const { access_id } = req.params;

    const access = await HospitalAccess.findOne({
      where: {
        id: access_id,
        medical_account_id: medicalAccountId
      }
    });

    if (!access) {
      return res.status(404).json({
        success: false,
        message: 'Access record not found'
      });
    }

    await access.update({
      is_active: false,
      revoked_at: new Date()
    });

    // Create audit log
    await AuditLog.create({
      medical_account_id: medicalAccountId,
      action_type: 'access_revoked',
      actor_type: 'user',
      actor_id: req.user.user_id,
      hospital_id: access.hospital_id,
      details: { access_id }
    });

    res.json({
      success: true,
      message: 'Hospital access revoked successfully'
    });
  } catch (error) {
    console.error('Revoke hospital access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke access'
    });
  }
};

// Get Medical Records
exports.getMedicalRecords = async (req, res) => {
  try {
    const medicalAccountId = req.user.id;

    const records = await MedicalRecord.findAll({
      where: { medical_account_id: medicalAccountId },
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['hospital_name']
      }],
      order: [['record_date', 'DESC']]
    });

    res.json({
      success: true,
      records
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch records'
    });
  }
};

// Get Medical Bills
exports.getMedicalBills = async (req, res) => {
  try {
    const medicalAccountId = req.user.id;

    const bills = await MedicalBill.findAll({
      where: { medical_account_id: medicalAccountId },
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['hospital_name', 'phone']
      }],
      order: [['bill_date', 'DESC']]
    });

    res.json({
      success: true,
      bills
    });
  } catch (error) {
    console.error('Get medical bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills'
    });
  }
};

// Get Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const medicalAccountId = req.user.id;

    const logs = await AuditLog.findAll({
      where: { medical_account_id: medicalAccountId },
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['hospital_name']
      }],
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
};
