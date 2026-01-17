const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Check if medical account exists (requires user login)
router.get('/account/status', authMiddleware, roleMiddleware('user'), medicalController.checkAccountStatus);

// Create medical account (requires user login)
router.post('/account/initiate', authMiddleware, roleMiddleware('user'), medicalController.initiateAccountCreation);
router.post('/account/create', authMiddleware, roleMiddleware('user'), medicalController.createMedicalAccount);

// Medical account login (separate from user login)
router.post('/login', medicalController.medicalLogin);

// Medical profile routes (requires medical login)
router.get('/profile', authMiddleware, roleMiddleware('medical_user'), medicalController.getMedicalProfile);
router.put('/profile', authMiddleware, roleMiddleware('medical_user'), medicalController.updateMedicalProfile);

// Hospital access management
router.post('/access/grant', authMiddleware, roleMiddleware('medical_user'), medicalController.grantHospitalAccess);
router.get('/access/active', authMiddleware, roleMiddleware('medical_user'), medicalController.getActiveAccess);
router.put('/access/revoke/:access_id', authMiddleware, roleMiddleware('medical_user'), medicalController.revokeHospitalAccess);

// Medical records
router.get('/records', authMiddleware, roleMiddleware('medical_user'), medicalController.getMedicalRecords);

// Medical bills
router.get('/bills', authMiddleware, roleMiddleware('medical_user'), medicalController.getMedicalBills);

// Audit logs
router.get('/audit-logs', authMiddleware, roleMiddleware('medical_user'), medicalController.getAuditLogs);

module.exports = router;
