import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from './_lib/supabase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
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

    const retentionDays = parseInt(process.env.DESIGN_RETENTION_DAYS || '7');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { data: oldItems, error: fetchError } = await supabaseAdmin
      .from('order_items')
      .select('design_storage_path, order_id')
      .not('design_storage_path', 'is', null)
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) {
      console.error('Fetch old items error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch old design files' });
    }

    if (!oldItems || oldItems.length === 0) {
      return res.status(200).json({ message: 'No design files to delete', deleted: 0 });
    }

    const paths = oldItems.map(item => item.design_storage_path!);
    const { error: storageError } = await supabaseAdmin.storage
      .from('customer-designs')
      .remove(paths);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      return res.status(500).json({ error: 'Failed to delete design files from storage' });
    }

    const itemIds = oldItems.map(item => item.order_id);
    const { error: updateError } = await supabaseAdmin
      .from('order_items')
      .update({ design_storage_path: null })
      .in('order_id', itemIds)
      .is('design_storage_path', paths);

    if (updateError) {
      console.error('Update items error:', updateError);
    }

    return res.status(200).json({ message: 'Old design files deleted', deleted: paths.length });
  } catch (error) {
    console.error('Delete design error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
