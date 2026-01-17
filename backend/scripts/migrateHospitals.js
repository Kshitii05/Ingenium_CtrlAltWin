// Migration script to fix hospital_unique_id constraint issue
const mysql = require('mysql2/promise');

async function migrateHospitals() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ingenium_db'
  });

  try {
    console.log('🔍 Checking hospitals table...');
    
    // Check if hospital_unique_id column exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM hospitals LIKE 'hospital_unique_id'
    `);

    if (columns.length === 0) {
      console.log('✅ Column does not exist yet - no migration needed');
      console.log('💡 Server will add the column automatically');
      
      // Check if there are any hospitals
      const [hospitals] = await connection.query('SELECT COUNT(*) as count FROM hospitals');
      const count = hospitals[0].count;
      
      if (count > 0) {
        console.log(`⚠️  Found ${count} existing hospital(s)`);
        console.log('🗑️  Dropping hospitals table to allow clean schema update...');
        await connection.query('DROP TABLE IF EXISTS hospital_accesses');
        await connection.query('DROP TABLE IF EXISTS hospitals');
        console.log('✅ Hospitals table dropped');
        console.log('💡 Server will recreate it with correct schema');
      }
    } else {
      console.log('✅ Column already exists');
      
      // Check for empty values
      const [emptyRows] = await connection.query(`
        SELECT COUNT(*) as count FROM hospitals 
        WHERE hospital_unique_id IS NULL OR hospital_unique_id = ''
      `);
      
      if (emptyRows[0].count > 0) {
        console.log(`🔧 Fixing ${emptyRows[0].count} hospital(s) with empty hospital_unique_id...`);
        await connection.query(`
          UPDATE hospitals 
          SET hospital_unique_id = CONCAT('HOSP-', id)
          WHERE hospital_unique_id IS NULL OR hospital_unique_id = ''
        `);
        console.log('✅ Migration complete');
      } else {
        console.log('✅ No migration needed');
      }
    }

    console.log('\n✅ Database ready for server startup!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

migrateHospitals()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
