const { User, Hospital, GovernmentUser } = require('../models');
const { generateToken } = require('../utils/jwt');

// User Login
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      type: 'user'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// User Registration
exports.userRegister = async (req, res) => {
  try {
    const { aadhaar_number, name, dob, gender, phone, address, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const existingAadhaar = await User.findOne({ where: { aadhaar_number } });
    if (existingAadhaar) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this Aadhaar number'
      });
    }

    const user = await User.create({
      aadhaar_number,
      name,
      dob,
      gender,
      phone,
      address,
      email,
      password_hash: password,
      is_verified: true
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      type: 'user'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Hospital Login
exports.hospitalLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hospital = await Hospital.findOne({ where: { email } });
    if (!hospital) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await hospital.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      id: hospital.id,
      email: hospital.email,
      type: 'hospital'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      hospital: {
        id: hospital.id,
        hospital_name: hospital.hospital_name,
        email: hospital.email
      }
    });
  } catch (error) {
    console.error('Hospital login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Hospital Registration
exports.hospitalRegister = async (req, res) => {
  try {
    const { hospital_name, facility_id, registration_number, email, password, phone, address, specializations } = req.body;

    const existingHospital = await Hospital.findOne({ where: { email } });
    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: 'Hospital already exists with this email'
      });
    }

    const hospital = await Hospital.create({
      hospital_name,      facility_id,      registration_number,
      email,
      password_hash: password,
      phone,
      address,
      specializations,
      is_verified: true
    });

    const token = generateToken({
      id: hospital.id,
      email: hospital.email,
      type: 'hospital'
    });

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully',
      token,
      hospital: {
        id: hospital.id,
        hospital_name: hospital.hospital_name,
        email: hospital.email
      }
    });
  } catch (error) {
    console.error('Hospital registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Government Login
exports.governmentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const govUser = await GovernmentUser.findOne({ where: { email } });
    if (!govUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await govUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      id: govUser.id,
      email: govUser.email,
      type: 'government',
      department: govUser.department,
      role: govUser.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: govUser.id,
        name: govUser.name,
        email: govUser.email,
        department: govUser.department,
        role: govUser.role
      }
    });
  } catch (error) {
    console.error('Government login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};
