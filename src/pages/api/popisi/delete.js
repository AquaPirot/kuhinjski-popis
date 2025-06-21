import { deletePopis } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: id' 
      });
    }

    await deletePopis(id);
    
    res.status(200).json({ 
      success: true, 
      message: 'Popis deleted successfully' 
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete popis',
      details: error.message 
    });
  }
}