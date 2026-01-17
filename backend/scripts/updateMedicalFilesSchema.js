require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateMedicalFilesSchema() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ingenium_db'
    });
    console.log('\u2705 Connected to database');
    
    // Add missing columns to medical_files table
    const columnsToAdd = [
      { name: 'hospital_id', definition: 'INT NULL' },
      { name: 'hospital_name', definition: 'VARCHAR(255) NULL' },
      { name: 'document_title', definition: 'VARCHAR(255) NULL' },
      { name: 'document_type', definition: 'ENUM(\'Report\', \'Prescription\', \'Bill\', \'Summary\', \'Lab Report\', \'Imaging\', \'Other\') NULL' },
      { name: 'notes', definition: 'TEXT NULL' },
      { name: 'visibility_to_hospital', definition: 'BOOLEAN DEFAULT TRUE' },
      { name: 'visibility_to_patient', definition: 'BOOLEAN DEFAULT TRUE' }
    ];
    
    for (const column of columnsToAdd) {
      // Check if column exists
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'ingenium_db' 
        AND TABLE_NAME = 'medical_files' 
        AND COLUMN_NAME = ?
      `, [column.name]);
      
      if (columns.length === 0) {
        console.log(`Adding column ${column.name}...`);
        await connection.execute(`
          ALTER TABLE medical_files 
          ADD COLUMN ${column.name} ${column.definition}
        `);
        console.log(`✅ Added ${column.name} column`);
      } else {
        console.log(`✓ Column ${column.name} already exists`);
      }
    }
    
    // Add foreign key for hospital_id if it doesn't exist
    const [fkConstraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'ingenium_db'
      AND TABLE_NAME = 'medical_files'
      AND COLUMN_NAME = 'hospital_id'
      AND REFERENCED_TABLE_NAME = 'hospitals'
    `);
    
    if (fkConstraints.length === 0) {
      console.log('Adding foreign key constraint for hospital_id...');
      try {
        await connection.execute(`
          ALTER TABLE medical_files 
          ADD CONSTRAINT fk_medical_files_hospital 
          FOREIGN KEY (hospital_id) REFERENCES hospitals(id) 
          ON DELETE SET NULL
        `);
        console.log('✅ Added foreign key constraint');
      } catch (err) {
        console.log('⚠️ Foreign key constraint may already exist or failed:', err.message);
      }
    } else {
      console.log('✓ Foreign key constraint already exists');
    }
    
    // Show final structure
    const [finalSchema] = await connection.execute('DESCRIBE medical_files');
    console.log('\n📋 Final medical_files table structure:');
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

updateMedicalFilesSchema();
