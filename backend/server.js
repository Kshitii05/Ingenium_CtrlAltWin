require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./config/database');

const app = express();

// Create upload directories
const uploadDirs = [
  path.join(__dirname, '../uploads/medical-files'),
  path.join(__dirname, '../uploads/farmer-documents')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created upload directory: ${dir}`);
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth/authRoutes'));
app.use('/api/medical', require('./routes/medical/medicalRoutes'));
app.use('/api/medical', require('./routes/medical/medicalFileRoutes'));
app.use('/api/medical', require('./routes/medical/medicalChatbotRoutes'));
app.use('/api/farmer', require('./routes/farmer/farmerRoutes'));
app.use('/api/farmer', require('./routes/farmer/farmerKYCRoutes'));
app.use('/api/government', require('./routes/auth/governmentRoutes'));
app.use('/api/hospital', require('./routes/auth/hospitalRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ingenium API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully');
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log('✅ Database synchronized');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to database:', err);
    process.exit(1);
  });

module.exports = app;
