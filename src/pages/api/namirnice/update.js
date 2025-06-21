import { updateItem } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, name, category, unit } = req.body;

    if (!id || !name || !category || !unit) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: id, name, category, unit' 
      });
    }

    await updateItem(id, name.trim(), category, unit);
    
    res.status(200).json({ 
      success: true, 
      data: { id, name, category, unit },
      message: 'Item updated successfully' 
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update item',
      details: error.message 
    });
  }
}