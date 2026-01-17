const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// All hospital routes require hospital login
router.get('/dashboard', authMiddleware, roleMiddleware('hospital'), hospitalController.getHospitalDashboard);
router.get('/patients', authMiddleware, roleMiddleware('hospital'), hospitalController.getActivePatients);
router.get('/patient/:medical_id', authMiddleware, roleMiddleware('hospital'), hospitalController.getPatientDetails);
router.post('/records/upload', authMiddleware, roleMiddleware('hospital'), hospitalController.uploadMedicalRecord);
router.post('/bills/create', authMiddleware, roleMiddleware('hospital'), hospitalController.createMedicalBill);

module.exports = router;
