const { Hospital, HospitalAccess, MedicalAccount, MedicalRecord, MedicalBill, AuditLog, User } = require('../models');
const { Op } = require('sequelize');

// Get Hospital Dashboard
exports.getHospitalDashboard = async (req, res) => {
  try {
    const hospitalId = req.user.id;

    // Get active patient access count
    const activeAccessCount = await HospitalAccess.count({
      where: {
        hospital_id: hospitalId,
        is_active: true,
        expires_at: {
          [Op.gt]: new Date()
        }
      }
    });

    // Get total records uploaded
    const recordsCount = await MedicalRecord.count({
      where: { hospital_id: hospitalId }
    });

    // Get total bills
    const billsCount = await MedicalBill.count({
      where: { hospital_id: hospitalId }
    });

    res.json({
      success: true,
      dashboard: {
        active_patients: activeAccessCount,
        total_records: recordsCount,
        total_bills: billsCount
      }
    });
  } catch (error) {
    console.error('Get hospital dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard'
    });
  }
};

// Get Patients with Active Access
exports.getActivePatients = async (req, res) => {
  try {
    const hospitalId = req.user.id;

    const activeAccess = await HospitalAccess.findAll({
      where: {
        hospital_id: hospitalId,
        is_active: true,
        expires_at: {
          [Op.gt]: new Date()
        }
      },
      include: [{
        model: MedicalAccount,
        as: 'medicalAccount',
        attributes: ['medical_id', 'email'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'dob', 'gender', 'phone']
        }]
      }],
      order: [['granted_at', 'DESC']]
    });

    res.json({
      success: true,
      patients: activeAccess
    });
  } catch (error) {
    console.error('Get active patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
};

// Get Patient Details (if hospital has access)
exports.getPatientDetails = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const { medical_id } = req.params;

    // Find medical account
    const medicalAccount = await MedicalAccount.findOne({
      where: { medical_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'dob', 'gender', 'phone', 'address']
      }]
    });

    if (!medicalAccount) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if hospital has active access
    const access = await HospitalAccess.findOne({
      where: {
        medical_account_id: medicalAccount.id,
        hospital_id: hospitalId,
        is_active: true,
        expires_at: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!access) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or expired'
      });
    }

    // Create audit log
    await AuditLog.create({
      medical_account_id: medicalAccount.id,
      action_type: 'data_viewed',
      actor_type: 'hospital',
      actor_id: hospitalId,
      hospital_id: hospitalId,
      details: { viewed_data: 'profile' }
    });

    // Filter data based on access scope
    const scopes = access.access_scope;
    const result = {
      medical_id: medicalAccount.medical_id,
      user: medicalAccount.user
    };

    if (scopes.includes('profile')) {
      result.profile = {
        allergies: medicalAccount.allergies,
        chronic_conditions: medicalAccount.chronic_conditions,
        current_medications: medicalAccount.current_medications,
        emergency_contact_name: medicalAccount.emergency_contact_name,
        emergency_contact_phone: medicalAccount.emergency_contact_phone,
        blood_group: medicalAccount.blood_group
      };
    }

    if (scopes.includes('records')) {
      result.records = await MedicalRecord.findAll({
        where: { medical_account_id: medicalAccount.id },
        order: [['record_date', 'DESC']],
        limit: 20
      });
    }

    if (scopes.includes('bills')) {
      result.bills = await MedicalBill.findAll({
        where: { medical_account_id: medicalAccount.id },
        order: [['bill_date', 'DESC']],
        limit: 20
      });
    }

    res.json({
      success: true,
      patient: result,
      access: {
        scopes: access.access_scope,
        permissions: access.permissions,
        expires_at: access.expires_at
      }
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient details'
    });
  }
};

// Upload Medical Record
exports.uploadMedicalRecord = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const { medical_id, record_type, title, description, record_date } = req.body;

    // Find medical account
    const medicalAccount = await MedicalAccount.findOne({
      where: { medical_id }
    });

    if (!medicalAccount) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if hospital has upload permission
    const access = await HospitalAccess.findOne({
      where: {
        medical_account_id: medicalAccount.id,
        hospital_id: hospitalId,
        is_active: true,
        expires_at: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!access) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or expired'
      });
    }

    if (!access.access_scope.includes('records') || !access.permissions.records?.upload) {
      return res.status(403).json({
        success: false,
        message: 'No permission to upload records'
      });
    }

    // Create medical record
    const record = await MedicalRecord.create({
      medical_account_id: medicalAccount.id,
      record_type,
      title,
      description,
      uploaded_by_type: 'hospital',
      uploaded_by_id: hospitalId,
      hospital_id: hospitalId,
      record_date
    });

    // Create audit log
    await AuditLog.create({
      medical_account_id: medicalAccount.id,
      action_type: 'data_uploaded',
      actor_type: 'hospital',
      actor_id: hospitalId,
      hospital_id: hospitalId,
      details: { record_type, title }
    });

    res.status(201).json({
      success: true,
      message: 'Medical record uploaded successfully',
      record
    });
  } catch (error) {
    console.error('Upload medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload record'
    });
  }
};

// Create Medical Bill
exports.createMedicalBill = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const { medical_id, bill_number, bill_date, total_amount, description } = req.body;

    // Find medical account
    const medicalAccount = await MedicalAccount.findOne({
      where: { medical_id }
    });

    if (!medicalAccount) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Create bill
    const bill = await MedicalBill.create({
      medical_account_id: medicalAccount.id,
      hospital_id: hospitalId,
      bill_number,
      bill_date,
      total_amount,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Medical bill created successfully',
      bill
    });
  } catch (error) {
    console.error('Create medical bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bill'
    });
  }
};
