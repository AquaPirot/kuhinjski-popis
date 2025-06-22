// src/utils/database.js - COMPLETE VERSION with JSON.parse fix
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'aggroup.rs',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'aggroup_kuhinjski_popis',
  password: process.env.DB_PASSWORD || '}SG[@Gb}T{mV1~HL',
  database: process.env.DB_NAME || 'aggroup_kuhinja_popis',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectTimeout: 60000,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Connection pool za bolje performanse
let pool;

const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

// Glavna funkcija za izvršavanje upita
export const executeQuery = async (query, params = []) => {
  const connection = createPool();
  
  try {
    console.log('Executing query:', query);
    console.log('With params:', params);
    
    const [results] = await connection.execute(query, params);
    
    console.log('Query results count:', results?.length || 0);
    
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw new Error(`Database error: ${error.message}`);
  }
};

// Test konekcije
export const testConnection = async () => {
  try {
    const results = await executeQuery('SELECT 1 as test, NOW() as server_time');
    console.log('✅ Database connection successful', results[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Helper funkcije za česte operacije
export const insertItem = async (name, category, unit) => {
  const query = 'INSERT INTO namirnice (name, category, unit) VALUES (?, ?, ?)';
  const result = await executeQuery(query, [name, category, unit]);
  return result.insertId;
};

export const getAllItems = async () => {
  const query = 'SELECT * FROM namirnice ORDER BY category, name';
  return await executeQuery(query);
};

export const updateItem = async (id, name, category, unit) => {
  const query = 'UPDATE namirnice SET name = ?, category = ?, unit = ? WHERE id = ?';
  return await executeQuery(query, [name, category, unit, id]);
};

export const deleteItem = async (id) => {
  const query = 'DELETE FROM namirnice WHERE id = ?';
  return await executeQuery(query, [id]);
};

export const deleteItems = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  const query = `DELETE FROM namirnice WHERE id IN (${placeholders})`;
  return await executeQuery(query, ids);
};

// FIXED savePopis function with better date handling
export const savePopis = async (datum, sastavio, items, srpski_datum = null) => {
  console.log('savePopis called with:', { datum, sastavio, itemsCount: items?.length, srpski_datum });
  
  try {
    // Validacija ulaznih podataka
    if (!datum || !sastavio || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid input data: missing datum, sastavio, or empty items array');
    }

    // Proveri svaki item
    const validItems = items.filter(item => {
      const isValid = item && 
        typeof item.name === 'string' && item.name.trim() && 
        typeof item.category === 'string' && item.category.trim() && 
        typeof item.unit === 'string' && item.unit.trim() && 
        typeof item.quantity === 'number' && item.quantity > 0;
      
      if (!isValid) {
        console.log('Invalid item found:', item);
      }
      
      return isValid;
    });

    if (validItems.length === 0) {
      throw new Error('No valid items found');
    }

    console.log('Valid items count:', validItems.length);

    // Konvertuj items u JSON string
    const itemsJson = JSON.stringify(validItems);
    
    console.log('About to insert:', { datum, sastavio, itemsJsonLength: itemsJson.length, srpski_datum });

    // Try with srpski_datum first, fallback if column doesn't exist
    let query, params;
    
    if (srpski_datum) {
      query = 'INSERT INTO popisi (datum, sastavio, items_json, srpski_datum) VALUES (?, ?, ?, ?)';
      params = [datum, sastavio.trim(), itemsJson, srpski_datum];
    } else {
      query = 'INSERT INTO popisi (datum, sastavio, items_json) VALUES (?, ?, ?)';
      params = [datum, sastavio.trim(), itemsJson];
    }
    
    try {
      const result = await executeQuery(query, params);
      
      console.log('Insert result:', result);
      
      if (!result.insertId) {
        throw new Error('Failed to get insert ID from database');
      }
      
      return result.insertId;
      
    } catch (columnError) {
      // If srpski_datum column doesn't exist, try without it
      if (columnError.message.includes('srpski_datum') && srpski_datum) {
        console.log('srpski_datum column not found, inserting without it');
        query = 'INSERT INTO popisi (datum, sastavio, items_json) VALUES (?, ?, ?)';
        params = [datum, sastavio.trim(), itemsJson];
        
        const result = await executeQuery(query, params);
        
        if (!result.insertId) {
          throw new Error('Failed to get insert ID from database');
        }
        
        return result.insertId;
      } else {
        throw columnError;
      }
    }
    
  } catch (error) {
    console.error('savePopis error:', error);
    throw error;
  }
};

// FIXED getAllPopisi with your JSON.parse protection
export const getAllPopisi = async () => {
  try {
    const query = 'SELECT * FROM popisi ORDER BY datum DESC, timestamp DESC';
    const results = await executeQuery(query);
    
    console.log('getAllPopisi raw results:', results?.length || 0);
    
    if (!results || results.length === 0) {
      return [];
    }
    
    // VAŠE REŠENJE: Zaštićeni JSON.parse
    const processedResults = results.map(popis => {
      try {
        return {
          ...popis,
          items: popis.items_json ? JSON.parse(popis.items_json) : [] // zaštita od praznog/null
        };
      } catch (parseError) {
        console.error('JSON parse error for popis', popis.id, parseError.message);
        return {
          ...popis,
          items: [] // fallback to empty array
        };
      }
    });
    
    console.log('getAllPopisi processed results:', processedResults.length);
    return processedResults;
    
  } catch (error) {
    console.error('getAllPopisi error:', error);
    throw error;
  }
};

export const deletePopis = async (id) => {
  const query = 'DELETE FROM popisi WHERE id = ?';
  return await executeQuery(query, [id]);
};

// Cleanup funkcija za graceful shutdown
export const closeConnections = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Database connections closed');
  }
};

export default {
  executeQuery,
  testConnection,
  insertItem,
  getAllItems,
  updateItem,
  deleteItem,
  deleteItems,
  savePopis,
  getAllPopisi,
  deletePopis,
  closeConnections
};