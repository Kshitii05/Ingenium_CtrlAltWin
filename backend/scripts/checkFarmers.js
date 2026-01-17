require('dotenv').config();
const { sequelize } = require('../config/database');
const FarmerAccount = require('../models/FarmerAccount');

async function checkFarmers() {
  try {
    await sequelize.authenticate();
    const farmers = await FarmerAccount.findAll();
    
    console.log(`\nTotal farmers: ${farmers.length}\n`);
    
    farmers.forEach(f => {
      console.log(JSON.stringify({
        id: f.id,
        kyc_id: f.kyc_id,
        email: f.email,
        full_name: f.full_name,
        mobile: f.mobile,
        state: f.state,
        land_area: f.land_area,
        crop_type: f.crop_type
      }, null, 2));
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkFarmers();
