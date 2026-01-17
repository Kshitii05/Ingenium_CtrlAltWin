const { Hospital, HospitalAccess, MedicalAccount, MedicalRecord, MedicalBill, AuditLog, User, MedicalFile } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

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

// Query Patient by Patient ID (Medical ID)
exports.queryPatient = async (req, res) => {
  try {
    const { patient_id } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Find medical account
    const medicalAccount = await MedicalAccount.findOne({
      where: { medical_id: patient_id },
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

    res.json({
      success: true,
      patient: {
        medical_id: medicalAccount.medical_id,
        name: medicalAccount.user.name,
        dob: medicalAccount.user.dob,
        gender: medicalAccount.user.gender,
        phone: medicalAccount.user.phone,
        blood_group: medicalAccount.blood_group,
        allergies: medicalAccount.allergies,
        chronic_conditions: medicalAccount.chronic_conditions
      }
    });
  } catch (error) {
    console.error('Query patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query patient'
    });
  }
};

// Get Patient Documents (only those visible to hospitals)
exports.getPatientDocs = async (req, res) => {
  try {
    const { patient_id } = req.params;

    // Find medical account
    const medicalAccount = await MedicalAccount.findOne({
      where: { medical_id: patient_id }
    });

    if (!medicalAccount) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Fetch files that are visible to hospitals
    const files = await MedicalFile.findAll({
      where: {
        medical_account_id: medicalAccount.id,
        visibility_to_hospital: true
      },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      files,
      patient: {
        medical_id: medicalAccount.medical_id,
        name: medicalAccount.user?.name
      }
    });
  } catch (error) {
    console.error('Get patient docs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient documents'
    });
  }
};

// Upload Document for Patient
exports.uploadDocument = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const hospitalName = req.user.hospital_name;
    const { patient_id } = req.params;
    const { document_title, document_type, notes, category } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Find medical account
    const medicalAccount = await MedicalAccount.findOne({
      where: { medical_id: patient_id }
    });

    if (!medicalAccount) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Create file record
    const file = await MedicalFile.create({
      medical_account_id: medicalAccount.id,
      file_name: req.file.originalname,
      file_type: req.file.mimetype,
      file_path: req.file.path,
      file_size: req.file.size,
      uploaded_by: 'hospital',
      uploaded_by_id: hospitalId,
      hospital_id: hospitalId,
      hospital_name: hospitalName,
      document_title: document_title || req.file.originalname,
      document_type: document_type || 'Other',
      notes: notes || null,
      category: category || 'records',
      visibility_to_hospital: true,
      visibility_to_patient: true // Hospital uploads are always visible to patient
    });

    // Create audit log
    await AuditLog.create({
      medical_account_id: medicalAccount.id,
      action_type: 'data_uploaded',
      actor_type: 'hospital',
      actor_id: hospitalId,
      hospital_id: hospitalId,
      details: { 
        document_title,
        document_type,
        file_name: req.file.originalname
      }
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      file
    });
  } catch (error) {
    console.error('Upload document error:', error);
    // Delete uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

// Get Hospital's Uploaded Documents
exports.getHospitalUploads = async (req, res) => {
  try {
    const hospitalId = req.user.id;

    const files = await MedicalFile.findAll({
      where: {
        hospital_id: hospitalId,
        uploaded_by: 'hospital'
      },
      include: [{
        model: MedicalAccount,
        as: 'medicalAccount',
        attributes: ['medical_id'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name']
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Get hospital uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch uploaded records'
    });
  }
};
