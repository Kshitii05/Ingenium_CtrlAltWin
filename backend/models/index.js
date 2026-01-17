const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const MedicalAccount = require('./MedicalAccount');
const HospitalAccess = require('./HospitalAccess');
const MedicalRecord = require('./MedicalRecord');
const MedicalBill = require('./MedicalBill');
const AuditLog = require('./AuditLog');
const Hospital = require('./Hospital');
const MedicalFolder = require('./MedicalFolder');
const MedicalFile = require('./MedicalFile');
const FarmerAccount = require('./FarmerAccount');
const FarmerDocument = require('./FarmerDocument');
const FarmerApplication = require('./FarmerApplication');
const GovernmentUser = require('./GovernmentUser');
const OTP = require('./OTP');

// Define relationships

// User relationships
User.hasOne(MedicalAccount, { foreignKey: 'user_id', as: 'medicalAccount' });
User.hasOne(FarmerAccount, { foreignKey: 'user_id', as: 'farmerAccount' });

// MedicalAccount relationships
MedicalAccount.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
MedicalAccount.hasMany(HospitalAccess, { foreignKey: 'medical_account_id', as: 'hospitalAccess' });
MedicalAccount.hasMany(MedicalRecord, { foreignKey: 'medical_account_id', as: 'medicalRecords' });
MedicalAccount.hasMany(MedicalBill, { foreignKey: 'medical_account_id', as: 'medicalBills' });
MedicalAccount.hasMany(AuditLog, { foreignKey: 'medical_account_id', as: 'auditLogs' });
MedicalAccount.hasMany(MedicalFolder, { foreignKey: 'medical_account_id', as: 'folders' });
MedicalAccount.hasMany(MedicalFile, { foreignKey: 'medical_account_id', as: 'files' });

// Hospital relationships
Hospital.hasMany(HospitalAccess, { foreignKey: 'hospital_id', as: 'patientAccess' });
Hospital.hasMany(MedicalRecord, { foreignKey: 'hospital_id', as: 'uploadedRecords' });
Hospital.hasMany(MedicalBill, { foreignKey: 'hospital_id', as: 'bills' });

// HospitalAccess relationships
HospitalAccess.belongsTo(MedicalAccount, { foreignKey: 'medical_account_id', as: 'medicalAccount' });
HospitalAccess.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

// MedicalRecord relationships
MedicalRecord.belongsTo(MedicalAccount, { foreignKey: 'medical_account_id', as: 'medicalAccount' });
MedicalRecord.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

// MedicalBill relationships
MedicalBill.belongsTo(MedicalAccount, { foreignKey: 'medical_account_id', as: 'medicalAccount' });
MedicalBill.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

// AuditLog relationships
AuditLog.belongsTo(MedicalAccount, { foreignKey: 'medical_account_id', as: 'medicalAccount' });
AuditLog.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

// FarmerAccount relationships
FarmerAccount.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
FarmerAccount.hasMany(FarmerDocument, { foreignKey: 'farmer_account_id', as: 'documents' });
FarmerAccount.hasMany(FarmerApplication, { foreignKey: 'farmer_account_id', as: 'applications' });

// FarmerDocument relationships
FarmerDocument.belongsTo(FarmerAccount, { foreignKey: 'farmer_account_id', as: 'farmerAccount' });

// FarmerApplication relationships
FarmerApplication.belongsTo(FarmerAccount, { foreignKey: 'farmer_account_id', as: 'farmerAccount' });
FarmerApplication.belongsTo(GovernmentUser, { foreignKey: 'reviewed_by', as: 'reviewer' });

// GovernmentUser relationships
GovernmentUser.hasMany(FarmerApplication, { foreignKey: 'reviewed_by', as: 'reviewedApplications' });

// MedicalFolder relationships
MedicalFolder.belongsTo(MedicalAccount, { foreignKey: 'medical_account_id', as: 'medicalAccount' });
MedicalFolder.belongsTo(MedicalFolder, { foreignKey: 'parent_id', as: 'parent' });
MedicalFolder.hasMany(MedicalFolder, { foreignKey: 'parent_id', as: 'children' });
MedicalFolder.hasMany(MedicalFile, { foreignKey: 'folder_id', as: 'files' });

// MedicalFile relationships
MedicalFile.belongsTo(MedicalAccount, { foreignKey: 'medical_account_id', as: 'medicalAccount' });
MedicalFile.belongsTo(MedicalFolder, { foreignKey: 'folder_id', as: 'folder' });

module.exports = {
  sequelize,
  User,
  MedicalAccount,
  HospitalAccess,
  MedicalRecord,
  MedicalBill,
  AuditLog,
  Hospital,
  MedicalFolder,
  MedicalFile,
  FarmerAccount,
  FarmerDocument,
  FarmerApplication,
  GovernmentUser,
  OTP
};
