const express = require('express');
const router = express.Router();
const governmentController = require('../../controllers/governmentController');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

// All government routes require government login
router.get('/dashboard', authMiddleware, roleMiddleware('government'), governmentController.getGovernmentDashboard);
router.get('/farmer/applications', authMiddleware, roleMiddleware('government'), governmentController.getFarmerApplications);
router.put('/farmer/applications/:application_id', authMiddleware, roleMiddleware('government'), governmentController.updateApplicationStatus);
router.get('/medical/:medical_id', authMiddleware, roleMiddleware('government'), governmentController.getMedicalAccountByID);

module.exports = router;
