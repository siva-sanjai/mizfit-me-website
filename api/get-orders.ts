import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from './_lib/supabase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    const { search, status } = req.query;

    if (status && status !== 'all') {
      query = query.eq('order_status', status);
    }

    if (search) {
      const searchStr = String(search);
      query = query.or(`order_number.ilike.%${searchStr}%,customer_name.ilike.%${searchStr}%,customer_email.ilike.%${searchStr}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get orders error:', error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
