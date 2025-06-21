// src/utils/database.js - Production Ready with Environment Variables
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'aggroup.rs',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'aggroup_kuhinjski_popis',
  password: process.env.DB_PASSWORD || '}SG[@Gb}T{mV1~HL',
  database: process.env.DB_NAME || 'aggroup_kuhinja_popis',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  // Dodatne opcije za stabilnost
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
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      // Production optimizacije
      idleTimeout: 300000,
      maxIdle: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
};

// Glavna funkcija za izvršavanje upita
export const executeQuery = async (query, params = []) => {
  const connection = createPool();
  
  try {
    const [results] = await connection.execute(query, params);
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

export const savePopis = async (datum, sastavio, items) => {
  const query = 'INSERT INTO popisi (datum, sastavio, items_json) VALUES (?, ?, ?)';
  const itemsJson = JSON.stringify(items);
  const result = await executeQuery(query, [datum, sastavio, itemsJson]);
  return result.insertId;
};

export const getAllPopisi = async () => {
  const query = 'SELECT * FROM popisi ORDER BY datum DESC, timestamp DESC';
  const results = await executeQuery(query);
  
  // Parse JSON strings back to objects with error handling
  return results.map(popis => {
    try {
      return {
        ...popis,
        items: JSON.parse(popis.items_json)
      };
    } catch (error) {
      console.error('Error parsing items JSON for popis:', popis.id, error);
      return {
        ...popis,
        items: []
      };
    }
  });
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