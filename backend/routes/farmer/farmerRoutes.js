const express = require('express');
const router = express.Router();
const farmerController = require('../../controllers/farmerController');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

// All farmer routes require user login
router.get('/account/status', authMiddleware, roleMiddleware('user'), farmerController.checkAccountStatus);
router.post('/account/create', authMiddleware, roleMiddleware('user'), farmerController.createFarmerAccount);
router.get('/profile', authMiddleware, roleMiddleware('user'), farmerController.getFarmerProfile);
router.get('/documents', authMiddleware, roleMiddleware('user'), farmerController.getFarmerDocuments);
router.get('/applications', authMiddleware, roleMiddleware('user'), farmerController.getFarmerApplications);
router.post('/applications', authMiddleware, roleMiddleware('user'), farmerController.submitApplication);

module.exports = router;
