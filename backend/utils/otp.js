const nodemailer = require('nodemailer');
const { OTP } = require('../models');

// Create transporter (configure based on your email service)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email, purpose = 'medical_account_creation') => {
  try {
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await OTP.create({
      email,
      otp_code: otpCode,
      purpose,
      expires_at: expiresAt
    });

    // Send email (in development, just log it)
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📧 OTP for ${email}: ${otpCode}\n`);
      return { success: true, otp: otpCode }; // For testing
    }

    // In production, send actual email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Ingenium',
      html: `
        <h2>Ingenium - OTP Verification</h2>
        <p>Your OTP code is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

const verifyOTP = async (email, otpCode, purpose) => {
  try {
    const otp = await OTP.findOne({
      where: {
        email,
        otp_code: otpCode,
        purpose,
        is_used: false
      },
      order: [['created_at', 'DESC']]
    });

    if (!otp) {
      return { success: false, message: 'Invalid OTP' };
    }

    if (new Date() > new Date(otp.expires_at)) {
      return { success: false, message: 'OTP has expired' };
    }

    // Mark OTP as used
    otp.is_used = true;
    await otp.save();

    return { success: true };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP');
  }
};

module.exports = { sendOTP, verifyOTP, generateOTP };
