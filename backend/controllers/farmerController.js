const { FarmerAccount, User, FarmerDocument, FarmerApplication, GovernmentUser } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Check Farmer Account Status
exports.checkAccountStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const farmerAccount = await FarmerAccount.findOne({
      where: { user_id: userId }
    });

    res.json({
      success: true,
      exists: !!farmerAccount,
      account: farmerAccount ? {
        id: farmerAccount.id,
        farmer_id: farmerAccount.farmer_id,
        kyc_status: farmerAccount.kyc_status
      } : null
    });
  } catch (error) {
    console.error('Check farmer account status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check account status'
    });
  }
};

// Create Farmer Account (Basic - for existing users)
exports.createFarmerAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { land_area, land_location, crop_types, bank_account, bank_ifsc } = req.body;

    // Check if account already exists
    const existingAccount = await FarmerAccount.findOne({
      where: { user_id: userId }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Farmer account already exists'
      });
    }

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create username from user data
    const username = user.name.toLowerCase().replace(/\s+/g, '') + userId;

    const farmerAccount = await FarmerAccount.create({
      user_id: userId,
      username: username,
      password_hash: 'temp_password_' + Date.now(), // Temporary password
      full_name: user.name,
      aadhaar: user.aadhaar_number || '000000000000', // Fallback if not available
      mobile: user.phone ? user.phone.substring(0, 10) : '0000000000',
      email: user.email || null,
      state: 'Unknown', // Will be updated later
      land_area: land_area || null,
      crop_type: crop_types || null,
      bank_account: bank_account || null,
      bank_ifsc: bank_ifsc || null,
      bank_name: 'Not Specified',
      kyc_status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Farmer account created successfully',
      account: {
        id: farmerAccount.id,
        kyc_id: farmerAccount.kyc_id,
        full_name: farmerAccount.full_name
      }
    });
  } catch (error) {
    console.error('Create farmer account error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create farmer account'
    });
  }
};

// Get Farmer Profile
exports.getFarmerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const farmerAccount = await FarmerAccount.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'dob', 'phone', 'email', 'address']
      }]
    });

    if (!farmerAccount) {
      return res.status(404).json({
        success: false,
        message: 'Farmer account not found'
      });
    }

    res.json({
      success: true,
      profile: farmerAccount
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Get Farmer Documents
exports.getFarmerDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const farmerAccount = await FarmerAccount.findOne({
      where: { user_id: userId }
    });

    if (!farmerAccount) {
      return res.status(404).json({
        success: false,
        message: 'Farmer account not found'
      });
    }

    const documents = await FarmerDocument.findAll({
      where: { farmer_account_id: farmerAccount.id },
      order: [['uploaded_at', 'DESC']]
    });

    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Get farmer documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
};

// Get Farmer Applications
exports.getFarmerApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const farmerAccount = await FarmerAccount.findOne({
      where: { user_id: userId }
    });

    if (!farmerAccount) {
      return res.status(404).json({
        success: false,
        message: 'Farmer account not found'
      });
    }

    const applications = await FarmerApplication.findAll({
      where: { farmer_account_id: farmerAccount.id },
      include: [{
        model: GovernmentUser,
        as: 'reviewer',
        attributes: ['name', 'department']
      }],
      order: [['submitted_at', 'DESC']]
    });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get farmer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Submit Farmer Application
exports.submitApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { application_type, title, description } = req.body;

    const farmerAccount = await FarmerAccount.findOne({
      where: { user_id: userId }
    });

    if (!farmerAccount) {
      return res.status(404).json({
        success: false,
        message: 'Farmer account not found'
      });
    }

    const application = await FarmerApplication.create({
      farmer_account_id: farmerAccount.id,
      application_type,
      title,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
};
