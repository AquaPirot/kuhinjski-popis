// src/pages/api/popisi/save.js - COMPLETE FIXED VERSION with DATE HANDLING
import { savePopis } from '@/utils/database';

export default async function handler(req, res) {
  console.log('API save called with method:', req.method); // Debug log
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { datum, sastavio, items, srpski_datum } = req.body;
    
    console.log('Received data:', { 
      datum, 
      sastavio, 
      itemsCount: items?.length,
      srpski_datum,
      rawBodyKeys: Object.keys(req.body)
    }); // Debug log

    // Validation
    if (!datum || !sastavio || !items) {
      console.log('Missing fields validation failed'); // Debug log
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: datum, sastavio, items',
        received: { datum: !!datum, sastavio: !!sastavio, items: !!items }
      });
    }

    if (!Array.isArray(items)) {
      console.log('Items not array validation failed'); // Debug log
      return res.status(400).json({ 
        success: false, 
        error: 'Items must be an array',
        itemsType: typeof items
      });
    }

    if (items.length === 0) {
      console.log('Empty items validation failed'); // Debug log
      return res.status(400).json({ 
        success: false, 
        error: 'Items array cannot be empty' 
      });
    }

    // Proveri MySQL datum format
    const mysqlDateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!mysqlDateRegex.test(datum)) {
      console.log('Invalid MySQL date format:', datum); // Debug log
      return res.status(400).json({ 
        success: false, 
        error: `Invalid date format. Expected YYYY-MM-DD HH:MM:SS, got: ${datum}`,
        receivedDatum: datum,
        formatExample: '2025-06-22 14:30:45'
      });
    }

    // Dodatna validacija datuma - pokušaj da ga parsiš
    try {
      const testDate = new Date(datum);
      if (isNaN(testDate.getTime())) {
        throw new Error('Invalid date');
      }
      
      // Proveri da li je datum u razumnom opsegu (ne sme biti pre 2020 ili posle 2030)
      const year = testDate.getFullYear();
      if (year < 2020 || year > 2030) {
        throw new Error(`Date year ${year} is outside reasonable range (2020-2030)`);
      }
      
    } catch (dateError) {
      console.log('Date parsing failed:', dateError.message); // Debug log
      return res.status(400).json({ 
        success: false, 
        error: `Date parsing failed: ${dateError.message}`,
        receivedDatum: datum
      });
    }

    // Proveri da li su svi potrebni podaci tu
    const validItems = items.filter(item => {
      const isValid = item && 
        item.name && 
        item.category && 
        item.unit && 
        typeof item.quantity === 'number' && 
        item.quantity > 0;
        
      if (!isValid) {
        console.log('Invalid item found:', item); // Debug log
      }
      
      return isValid;
    });

    if (validItems.length === 0) {
      console.log('No valid items found'); // Debug log
      console.log('Original items:', items); // Debug log
      return res.status(400).json({ 
        success: false, 
        error: 'No valid items found with required fields (name, category, unit, quantity > 0)',
        itemsReceived: items.length,
        validItemsFound: validItems.length,
        sampleItem: items[0] || null
      });
    }

    console.log('Validation passed. Attempting to save to database...'); // Debug log
    console.log('MySQL datum format check passed:', datum); // Debug log
    console.log('Valid items:', validItems.length, 'of', items.length); // Debug log

    // Pozovi savePopis sa srpski_datum ako je prosleđen
    const insertId = await savePopis(datum, sastavio.trim(), validItems, srpski_datum);
    
    console.log('Successfully saved with ID:', insertId); // Debug log
    
    res.status(201).json({ 
      success: true, 
      data: { 
        id: insertId, 
        datum, 
        srpski_datum,
        sastavio: sastavio.trim(), 
        items: validItems 
      },
      message: 'Popis saved successfully',
      debug: {
        mysqlDatum: datum,
        srpskiDatum: srpski_datum,
        itemsCount: validItems.length,
        insertId: insertId
      }
    });
  } catch (error) {
    console.error('API Error details:', error); // Debug log
    console.error('Error stack:', error.stack); // Debug log
    
    // Proveri da li je MySQL greška
    if (error.message.includes('Incorrect datetime value')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid date format for MySQL database',
        details: error.message,
        receivedDate: req.body.datum,
        expectedFormat: 'YYYY-MM-DD HH:MM:SS'
      });
    }
    
    // MySQL connection errors
    if (error.message.includes('connect') || error.message.includes('timeout')) {
      return res.status(503).json({ 
        success: false, 
        error: 'Database connection error',
        details: 'Unable to connect to database. Please try again later.'
      });
    }
    
    // Table/column errors
    if (error.message.includes("doesn't exist")) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database schema error',
        details: error.message,
        suggestion: 'Please check if the popisi table exists and has the correct structure.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save popis',
      details: error.message,
      // Dodaj više detalja za debug u development
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        received: req.body,
        sqlError: error.sqlMessage || error.sqlState,
        errorCode: error.code,
        errorNumber: error.errno
      })
    });
  }
}