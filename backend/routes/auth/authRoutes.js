const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');

// User routes
router.post('/user/register', authController.userRegister);
router.post('/user/login', authController.userLogin);

// Hospital routes
router.post('/hospital/register', authController.hospitalRegister);
router.post('/hospital/login', authController.hospitalLogin);

// Government routes
router.post('/government/login', authController.governmentLogin);

module.exports = router;
