import { savePopis } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { datum, sastavio, items } = req.body;

    if (!datum || !sastavio || !items) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: datum, sastavio, items' 
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Items must be an array' 
      });
    }

    const insertId = await savePopis(datum, sastavio.trim(), items);
    
    res.status(201).json({ 
      success: true, 
      data: { id: insertId, datum, sastavio, items },
      message: 'Popis saved successfully' 
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save popis',
      details: error.message 
    });
  }
}