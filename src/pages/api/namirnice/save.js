import { insertItem } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, category, unit } = req.body;

    if (!name || !category || !unit) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, category, unit' 
      });
    }

    const insertId = await insertItem(name.trim(), category, unit);
    
    res.status(201).json({ 
      success: true, 
      data: { id: insertId, name, category, unit },
      message: 'Item created successfully' 
    });
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.message.includes('Duplicate entry')) {
      return res.status(409).json({ 
        success: false, 
        error: 'Namirnica sa tim nazivom već postoji!' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save item',
      details: error.message 
    });
  }
}