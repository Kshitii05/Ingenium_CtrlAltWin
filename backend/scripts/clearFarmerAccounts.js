require('dotenv').config();
const { sequelize } = require('../config/database');
const { FarmerAccount } = require('../models');

async function clearFarmerAccounts() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const farmers = await FarmerAccount.findAll({
      attributes: ['id', 'email', 'kyc_id', 'full_name']
    });
    
    console.log(`\n📊 Found ${farmers.length} farmer accounts:`);
    farmers.forEach(farmer => {
      console.log(`  - ${farmer.full_name} (${farmer.email}) - KYC: ${farmer.kyc_id}`);
    });
    
    if (farmers.length > 0) {
      const count = await FarmerAccount.destroy({ where: {} });
      console.log(`\n✅ Deleted ${count} farmer accounts`);
    } else {
      console.log('\n✅ No farmer accounts to delete');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearFarmerAccounts();
