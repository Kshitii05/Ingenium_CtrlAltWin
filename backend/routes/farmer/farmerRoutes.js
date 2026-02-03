const express = require('express');
const router = express.Router();
const farmerController = require('../../controllers/farmerController');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

// All farmer routes require user login
router.get('/account/status', authMiddleware, roleMiddleware('user', 'farmer'), farmerController.checkAccountStatus);
router.post('/account/create', authMiddleware, roleMiddleware('user', 'farmer'), farmerController.createFarmerAccount);
router.get('/profile', authMiddleware, roleMiddleware('user', 'farmer'), farmerController.getFarmerProfile);
router.get('/documents', authMiddleware, roleMiddleware('user', 'farmer'), farmerController.getFarmerDocuments);
router.get('/applications', authMiddleware, roleMiddleware('user', 'farmer'), farmerController.getFarmerApplications);
router.post('/applications', authMiddleware, roleMiddleware('user', 'farmer'), farmerController.submitApplication);

module.exports = router;
