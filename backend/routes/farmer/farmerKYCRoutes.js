const express = require('express');
const router = express.Router();
const farmerKYCController = require('../../controllers/farmerKYCController');
const { authFarmer } = require('../../middleware/auth');

// Public routes
router.post('/kyc-register', farmerKYCController.registerFarmerKYC);
router.post('/login', farmerKYCController.loginFarmer);
router.get('/states', farmerKYCController.getStates);

// Protected routes
router.get('/profile', authFarmer, farmerKYCController.getFarmerProfile);
router.put('/profile', authFarmer, farmerKYCController.updateFarmerProfile);

module.exports = router;
