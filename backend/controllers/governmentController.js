const { GovernmentUser, FarmerApplication, FarmerAccount, User, MedicalAccount } = require('../models');

// Get Government Dashboard
exports.getGovernmentDashboard = async (req, res) => {
  try {
    const { department } = req.user;

    let stats = {};

    if (department === 'agriculture') {
      const pendingCount = await FarmerApplication.count({
        where: { status: 'submitted' }
      });
      
      const underReviewCount = await FarmerApplication.count({
        where: { status: 'under_review' }
      });

      stats = {
        pending_applications: pendingCount,
        under_review: underReviewCount
      };
    }

    res.json({
      success: true,
      department,
      stats
    });
  } catch (error) {
    console.error('Get government dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard'
    });
  }
};

// Get Farmer Applications (for agriculture department)
exports.getFarmerApplications = async (req, res) => {
  try {
    const { department } = req.user;
    
    if (department !== 'agriculture') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    }

    const applications = await FarmerApplication.findAll({
      where,
      include: [{
        model: FarmerAccount,
        as: 'farmerAccount',
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'phone', 'email']
        }]
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

// Update Application Status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { department } = req.user;
    const { application_id } = req.params;
    const { status, government_reply } = req.body;

    if (department !== 'agriculture') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const application = await FarmerApplication.findByPk(application_id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update({
      status,
      government_reply,
      reviewed_at: new Date(),
      reviewed_by: req.user.id
    });

    res.json({
      success: true,
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
};

// Get Medical Account by Medical ID (for health department)
exports.getMedicalAccountByID = async (req, res) => {
  try {
    const { department } = req.user;
    const { medical_id } = req.params;

    if (department !== 'health') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const medicalAccount = await MedicalAccount.findOne({
      where: { medical_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'dob', 'gender', 'phone', 'address', 'aadhaar_number']
      }]
    });

    if (!medicalAccount) {
      return res.status(404).json({
        success: false,
        message: 'Medical account not found'
      });
    }

    res.json({
      success: true,
      account: medicalAccount
    });
  } catch (error) {
    console.error('Get medical account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical account'
    });
  }
};
