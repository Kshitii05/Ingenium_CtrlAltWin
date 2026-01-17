require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateHospitalSchema() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ingenium_db'
    });
    console.log('✅ Connected to database');
    
    // Check if hfr_id column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'ingenium_db' 
      AND TABLE_NAME = 'hospitals' 
      AND COLUMN_NAME = 'hfr_id'
    `);
    
    if (columns.length === 0) {
      console.log('Adding hfr_id column to hospitals table...');
      
      // Add hfr_id column
      await connection.execute(`
        ALTER TABLE hospitals 
        ADD COLUMN hfr_id VARCHAR(255) NULL AFTER hospital_name
      `);
      
      console.log('✅ Added hfr_id column');
    } else {
      console.log('✅ hfr_id column already exists');
    }
    
    // Check if facility_id column exists (old column to remove)
    const [oldColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'ingenium_db' 
      AND TABLE_NAME = 'hospitals' 
      AND COLUMN_NAME = 'facility_id'
    `);
    
    if (oldColumns.length > 0) {
      console.log('Removing old facility_id column...');
      await connection.execute(`
        ALTER TABLE hospitals 
        DROP COLUMN facility_id
      `);
      console.log('✅ Removed old facility_id column');
    }
    
    // Show final structure
    const [finalSchema] = await connection.execute('DESCRIBE hospitals');
    console.log('\n📋 Final hospitals table structure:');
    console.table(finalSchema);
    
    console.log('\n✅ Schema update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateHospitalSchema();
