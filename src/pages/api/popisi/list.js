import { getAllPopisi } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const popisi = await getAllPopisi();
    res.status(200).json({ success: true, data: popisi });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch popisi',
      details: error.message 
    });
  }
}