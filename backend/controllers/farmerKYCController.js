const FarmerAccount = require('../models/FarmerAccount');
const { generateToken } = require('../utils/jwt');

// Indian states list
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// Farmer KYC Registration
exports.registerFarmerKYC = async (req, res) => {
  try {
    const {
      // Identity & Contact
      full_name, aadhaar, mobile, email, city, state,
      // Agricultural Details
      land_ownership, land_area, village, taluka, district, pincode,
      crop_type, irrigation_type, storage_capacity,
      // Financial Details
      bank_account, bank_ifsc, bank_name, kcc_number, farmer_id
    } = req.body;

    // Validation
    if (!full_name || !aadhaar || !mobile || !email || !state || !bank_account || !bank_ifsc || !bank_name) {
      console.log('Missing required fields:', {
        full_name: !!full_name,
        aadhaar: !!aadhaar,
        mobile: !!mobile,
        email: !!email,
        state: !!state,
        bank_account: !!bank_account,
        bank_ifsc: !!bank_ifsc,
        bank_name: !!bank_name
      });
      
      const missingFields = [];
      if (!full_name) missingFields.push('Full Name');
      if (!aadhaar) missingFields.push('Aadhaar');
      if (!mobile) missingFields.push('Mobile');
      if (!email) missingFields.push('Email');
      if (!state) missingFields.push('State');
      if (!bank_account) missingFields.push('Bank Account');
      if (!bank_ifsc) missingFields.push('IFSC Code');
      if (!bank_name) missingFields.push('Bank Name');
      
      return res.status(400).json({
        success: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`
      });
    }

    // Validate Aadhaar (12 digits)
    if (!/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar must be exactly 12 digits'
      });
    }

    // Validate Mobile (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile must be exactly 10 digits'
      });
    }

    // Validate state
    if (!INDIAN_STATES.includes(state)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state selected'
      });
    }

    // Check if Aadhaar already exists
    const existingAadhaar = await FarmerAccount.findOne({
      where: { aadhaar }
    });

    if (existingAadhaar) {
      return res.status(400).json({
        success: false,
        message: 'Farmer with this Aadhaar already registered'
      });
    }

    // Check if email already exists
    const existingEmail = await FarmerAccount.findOne({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create farmer account (KYC ID will be auto-generated in beforeValidate hook)
    // Username = email, password = KYC ID (will be set after creation)
    const farmerAccount = await FarmerAccount.create({
      // Identity & Contact
      full_name, aadhaar, mobile, email, city, state,
      // Agricultural Details
      land_ownership, land_area, village, taluka, district, pincode,
      crop_type, irrigation_type, storage_capacity,
      // Financial Details
      bank_account, bank_ifsc, bank_name, kcc_number, farmer_id,
      // Account (use email as username, KYC ID as password)
      username: email,
      password_hash: 'TEMP_PASSWORD' // Will be updated to KYC ID after creation
    });

    // Update password to be the KYC ID (so users login with email and KYC ID)
    await farmerAccount.update({
      password_hash: farmerAccount.kyc_id
    }, { 
      hooks: false // Skip password hashing hook since KYC ID should be stored as plain text
    });

    res.status(201).json({
      success: true,
      message: 'Farmer KYC registration successful',
      kyc_id: farmerAccount.kyc_id,
      farmer: {
        id: farmerAccount.id,
        kyc_id: farmerAccount.kyc_id,
        full_name: farmerAccount.full_name,
        username: farmerAccount.username,
        state: farmerAccount.state
      }
    });
  } catch (error) {
    console.error('Farmer KYC registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Farmer Login
exports.loginFarmer = async (req, res) => {
  try {
    const { email, kyc_id } = req.body;

    if (!email || !kyc_id) {
      return res.status(400).json({
        success: false,
        message: 'Email and KYC ID are required'
      });
    }

    // Find farmer by email (username) and KYC ID (password)
    const farmer = await FarmerAccount.findOne({
      where: { 
        username: email, // Email is stored as username
        is_active: true 
      }
    });

    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or KYC ID'
      });
    }

    // Verify KYC ID matches the stored password
    if (farmer.password_hash !== kyc_id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or KYC ID'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: farmer.id,
      kyc_id: farmer.kyc_id,
      username: farmer.username,
      role: 'farmer'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      farmer: {
        id: farmer.id,
        kyc_id: farmer.kyc_id,
        full_name: farmer.full_name,
        username: farmer.username,
        mobile: farmer.mobile,
        state: farmer.state,
        kyc_status: farmer.kyc_status
      }
    });
  } catch (error) {
    console.error('Farmer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get Farmer Profile
exports.getFarmerProfile = async (req, res) => {
  try {
    const farmerId = req.farmer.id;

    const farmer = await FarmerAccount.findByPk(farmerId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    res.json({
      success: true,
      profile: farmer
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update Farmer Profile
exports.updateFarmerProfile = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.kyc_id;
    delete updates.aadhaar;
    delete updates.username;
    delete updates.password_hash;
    delete updates.created_at;

    const farmer = await FarmerAccount.findByPk(farmerId);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    await farmer.update(updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: farmer
    });
  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Get States List
exports.getStates = async (req, res) => {
  res.json({
    success: true,
    states: INDIAN_STATES
  });
};

module.exports = exports;
