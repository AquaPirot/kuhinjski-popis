// src/pages/api/test-db.js - Database Test Endpoint
import { testConnection, executeQuery } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection failed' 
      });
    }

    const tableCheck = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'aggroup_kuhinja_popis'
    `);

    const namirnicaCount = await executeQuery(
      'SELECT COUNT(*) as count FROM namirnice'
    );

    const popisCount = await executeQuery(
      'SELECT COUNT(*) as count FROM popisi'
    );

    const sampleItems = await executeQuery(
      'SELECT id, name, category, unit FROM namirnice LIMIT 5'
    );

    res.status(200).json({
      success: true,
      connection: 'OK',
      database: 'aggroup_kuhinja_popis',
      tables: tableCheck.map(t => t.table_name),
      counts: {
        namirnice: namirnicaCount[0]?.count || 0,
        popisi: popisCount[0]?.count || 0
      },
      sampleItems: sampleItems,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: 'Database test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}