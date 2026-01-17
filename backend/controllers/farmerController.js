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

// Create Farmer Account
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

    const farmerId = `FRM-${uuidv4().substring(0, 8).toUpperCase()}`;

    const farmerAccount = await FarmerAccount.create({
      user_id: userId,
      farmer_id: farmerId,
      land_area,
      land_location,
      crop_types,
      bank_account,
      bank_ifsc
    });

    res.status(201).json({
      success: true,
      message: 'Farmer account created successfully',
      account: farmerAccount
    });
  } catch (error) {
    console.error('Create farmer account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create farmer account'
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
