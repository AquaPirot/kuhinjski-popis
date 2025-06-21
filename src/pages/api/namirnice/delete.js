import { deleteItem, deleteItems } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, ids } = req.body;

    if (ids && Array.isArray(ids)) {
      await deleteItems(ids);
      res.status(200).json({ 
        success: true, 
        message: `Successfully deleted ${ids.length} items` 
      });
    } else if (id) {
      await deleteItem(id);
      res.status(200).json({ 
        success: true, 
        message: 'Item deleted successfully' 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing id or ids parameter' 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete item(s)',
      details: error.message 
    });
  }
}