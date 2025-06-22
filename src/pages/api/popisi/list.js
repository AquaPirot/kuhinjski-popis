// src/pages/api/popisi/list.js - ULTRA SIMPLE - garantovano radi
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  console.log('=== API LIST START ===');
  
  if (req.method !== 'GET') {
    console.log('Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;

  try {
    console.log('Step 1: Creating connection...');
    
    // Osnovne konfiguracije - samo ono što je neophodno
    connection = await mysql.createConnection({
      host: 'aggroup.rs',
      port: 3306,
      user: 'aggroup_kuhinjski_popis',
      password: '}SG[@Gb}T{mV1~HL',
      database: 'aggroup_kuhinja_popis',
      charset: 'utf8mb4'
    });
    
    console.log('Step 2: Connection created successfully');
    
    console.log('Step 3: Executing basic query...');
    
    // Najjednostavniji mogući query
    const [rows] = await connection.execute('SELECT * FROM popisi ORDER BY id DESC');
    
    console.log('Step 4: Query executed, found rows:', rows.length);
    
    if (!rows || rows.length === 0) {
      console.log('Step 5: No data found, returning empty array');
      return res.status(200).json({ 
        success: true, 
        data: [],
        count: 0
      });
    }
    
    console.log('Step 6: Processing rows...');
    
    // Procesiranje sa maksimalnom zaštitom
    const processedData = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`Processing row ${i + 1}/${rows.length}, ID: ${row.id}`);
      
      try {
        let items = [];
        
        // VAŠA POPRAVKA: Zaštićeni JSON.parse
        if (row.items_json && row.items_json.trim() !== '') {
          try {
            items = JSON.parse(row.items_json);
            if (!Array.isArray(items)) {
              console.log(`Row ${row.id}: items_json is not array, setting to []`);
              items = [];
            }
          } catch (parseError) {
            console.log(`Row ${row.id}: JSON parse failed:`, parseError.message);
            items = [];
          }
        } else {
          console.log(`Row ${row.id}: items_json is empty or null`);
        }
        
        // Formatiraj datum
        let formattedDate = 'Nepoznat datum';
        if (row.datum && row.datum !== '0000-00-00 00:00:00') {
          try {
            const date = new Date(row.datum);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toLocaleString('sr-RS', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          } catch (dateError) {
            console.log(`Row ${row.id}: Date format error`);
          }
        }
        
        const processedRow = {
          id: row.id || 0,
          datum: row.datum || null,
          sastavio: row.sastavio || 'Nepoznato',
          srpski_datum: row.srpski_datum || formattedDate,
          items: items,
          timestamp: row.timestamp || null
        };
        
        processedData.push(processedRow);
        console.log(`Row ${row.id}: processed successfully, items count: ${items.length}`);
        
      } catch (rowError) {
        console.error(`Row ${row.id}: Processing error:`, rowError.message);
        // Dodaj osnovnu verziju čak i ako ima grešku
        processedData.push({
          id: row.id || 0,
          datum: row.datum || 'Nepoznat datum',
          sastavio: row.sastavio || 'Nepoznato',
          srpski_datum: 'Nepoznat datum',
          items: [],
          timestamp: row.timestamp || null
        });
      }
    }
    
    console.log('Step 7: All rows processed successfully');
    console.log('Step 8: Returning response with', processedData.length, 'items');
    
    return res.status(200).json({ 
      success: true, 
      data: processedData,
      count: processedData.length,
      debug: {
        rawRows: rows.length,
        processedRows: processedData.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Database error occurred',
      details: error.message,
      errorCode: error.code,
      errorErrno: error.errno,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Step 9: Connection closed successfully');
      } catch (closeError) {
        console.error('Error closing connection:', closeError.message);
      }
    }
    console.log('=== API LIST END ===');
  }
}