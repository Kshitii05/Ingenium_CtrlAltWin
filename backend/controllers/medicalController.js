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

// Create Medical Account (Direct creation without OTP)
exports.createMedicalAccount = async (req, res) => {
  try {
    const { email, password, blood_group, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone } = req.body;
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

    // Get user details
    const user = await User.findByPk(userId);

    // Create medical account
    const medicalAccount = await MedicalAccount.create({
      user_id: userId,
      email,
      password_hash: password,
      blood_group: blood_group || null,
      allergies: allergies || null,
      chronic_conditions: chronic_conditions || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_phone: emergency_contact_phone || null,
      is_active: true
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
        gender: medicalAccount.gender,
        allergies: medicalAccount.allergies,
        chronic_conditions: medicalAccount.chronic_conditions,
        current_medications: medicalAccount.current_medications,
        past_surgeries: medicalAccount.past_surgeries,
        disabilities: medicalAccount.disabilities,
        emergency_contact_name: medicalAccount.emergency_contact_name,
        emergency_contact_phone: medicalAccount.emergency_contact_phone,
        emergency_contact_relation: medicalAccount.emergency_contact_relation,
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
      gender,
      allergies,
      chronic_conditions,
      current_medications,
      past_surgeries,
      disabilities,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
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
      gender,
      allergies,
      chronic_conditions,
      current_medications,
      past_surgeries,
      disabilities,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
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
    const { hospital_identifier, scopes, permission_type, duration } = req.body;

    // Validate input
    if (!hospital_identifier || !scopes || !permission_type || !duration) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Find hospital by hfr_id (since that's what the user enters)
    const hospital = await Hospital.findOne({
      where: { hfr_id: hospital_identifier }
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found with this HFR ID'
      });
    }

    // Calculate expiry date based on duration
    let expiresAt;
    if (duration === 'revoked') {
      // Set far future date for "until revoked"
      expiresAt = new Date('2099-12-31');
    } else {
      expiresAt = new Date();
      const days = parseInt(duration);
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    // Create access with scopes as JSON array
    const hospitalAccess = await HospitalAccess.create({
      medical_account_id: medicalAccountId,
      hospital_id: hospital.id,
      access_scope: scopes, // Array of: profile, records, bills, insurance
      permissions: { type: permission_type }, // read_only or upload_allowed
      expires_at: expiresAt
    });

    // Create audit log
    await AuditLog.create({
      medical_account_id: medicalAccountId,
      action_type: 'access_granted',
      actor_type: 'user',
      actor_id: medicalAccountId,
      hospital_id: hospital.id,
      details: { scopes, permission_type, duration }
    });

    res.status(201).json({
      success: true,
      message: 'Hospital access granted successfully',
      access: {
        ...hospitalAccess.toJSON(),
        hospital: {
          id: hospital.id,
          hospital_name: hospital.hospital_name,
          hospital_unique_id: hospital.hospital_unique_id
        }
      }
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
        is_active: true
      },
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'hospital_name', 'hospital_unique_id', 'email', 'phone']
      }],
      order: [['granted_at', 'DESC']]
    });

    // Format response to include status (active/expired)
    const formattedAccess = activeAccess.map(access => {
      const now = new Date();
      const isExpired = access.expires_at < now;
      
      return {
        ...access.toJSON(),
        status: isExpired ? 'expired' : 'active',
        is_expired: isExpired
      };
    });

    res.json({
      success: true,
      access: formattedAccess
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
      actor_id: medicalAccountId,
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
