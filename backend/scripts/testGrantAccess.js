require('dotenv').config();
const mysql = require('mysql2/promise');

async function testGrantAccess() {
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
    
    // Check if hospital with unique_id exists
    const [hospitals] = await connection.execute(
      'SELECT * FROM hospitals WHERE hospital_unique_id = ?',
      ['12345']
    );
    
    console.log('\nHospitals found:', hospitals);
    
    // Try to insert access
    if (hospitals.length > 0) {
      try {
        const [result] = await connection.execute(`
          INSERT INTO hospital_access 
          (medical_account_id, hospital_id, access_scope, permissions, expires_at, granted_at, is_active) 
          VALUES (?, ?, ?, ?, ?, NOW(), 1)
        `, [
          1, // medical_account_id
          hospitals[0].id, // hospital_id
          JSON.stringify(['profile', 'records']), // access_scope
          JSON.stringify({ type: 'read_only' }), // permissions
          '2099-12-31' // expires_at
        ]);
        console.log('\n✅ Access granted:', result);
      } catch (err) {
        console.error('\n❌ Error granting access:', err.message);
        console.error('SQL State:', err.sqlState);
        console.error('Error Code:', err.errno);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testGrantAccess();
