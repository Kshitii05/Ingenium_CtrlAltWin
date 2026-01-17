require('dotenv').config();
const { sequelize } = require('../config/database');
const models = require('../models');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ All models synchronized');

    // Create sample government user
    const { GovernmentUser, Hospital } = models;

    const existingGov = await GovernmentUser.findOne({ where: { email: 'officer@gov.in' } });
    if (!existingGov) {
      await GovernmentUser.create({
        officer_id: 'GOV-001',
        name: 'Agriculture Officer',
        email: 'officer@gov.in',
        password_hash: 'password123',
        department: 'agriculture',
        role: 'officer',
        phone: '9876543210'
      });
      console.log('✅ Sample government user created (officer@gov.in / password123)');
    }

    // Create sample hospital
    const existingHospital = await Hospital.findOne({ where: { email: 'hospital@example.com' } });
    if (!existingHospital) {
      await Hospital.create({
        hospital_name: 'City General Hospital',
        registration_number: 'HOSP-2024-001',
        email: 'hospital@example.com',
        password_hash: 'password123',
        phone: '9876543211',
        address: '123 Medical Street, City',
        specializations: ['General Medicine', 'Surgery', 'Pediatrics'],
        is_verified: true
      });
      console.log('✅ Sample hospital created (hospital@example.com / password123)');
    }

    console.log('\n🎉 Database setup completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
