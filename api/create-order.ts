import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      `Missing env vars: SUPABASE_URL=${!!supabaseUrl}, SUPABASE_SERVICE_ROLE_KEY=${!!supabaseServiceRoleKey}`
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[create-order] Handler invoked', { method: req.method });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    console.log('[create-order] Supabase client initialized');

    const {
      customer_name,
      customer_email,
      customer_phone,
      address,
      city,
      state,
      postal_code,
      payment_method,
      total_amount,
      items,
      uploaded_designs,
    } = req.body;

    console.log('[create-order] Request body received', {
      customer_name: !!customer_name,
      items_count: items?.length,
      uploaded_designs_count: uploaded_designs?.length,
    });

    if (!customer_name || !customer_email || !customer_phone || !address || !city || !state || !postal_code) {
      return res.status(400).json({ error: 'Missing required customer fields' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    console.log('[create-order] Validation complete');

    const year = new Date().getFullYear();
    const { count: totalOrders, error: countError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[create-order] Count query error:', countError);
    }

    const currentCount = totalOrders || 0;
    const orderNumber = `ORD-${year}-${String(currentCount + 1).padStart(5, '0')}`;

    if (uploaded_designs && uploaded_designs.length > 0) {
      for (const design of uploaded_designs) {
        if (!design.storage_path) continue;
        const { data: fileData, error: existsErr } = await supabaseAdmin.storage
          .from('customer-designs')
          .exists(design.storage_path);

        if (existsErr) {
          console.warn('[create-order] Design check error:', existsErr.message);
        }
      }
    }

    console.log('[create-order] Supabase insert started');

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim().toLowerCase(),
        customer_phone: customer_phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postal_code.trim(),
        total_amount: total_amount || items.reduce((sum: number, item: any) => sum + (item.item_price * item.quantity), 0),
        payment_method: payment_method || 'cod',
        payment_status: 'pending',
        order_status: 'pending',
        email_sent: false,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[create-order] Order insert error:', orderError);
      return res.status(500).json({
        error: 'Failed to create order',
        detail: orderError.message,
        code: orderError.code,
      });
    }

    console.log('[create-order] Order created:', order.id);

    const orderItems = items.map((item: any, index: number) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      print_side: item.print_side || 'front',
      design_file_name: uploaded_designs?.[index]?.file_name || null,
      design_storage_path: uploaded_designs?.[index]?.storage_path || null,
      item_price: item.item_price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[create-order] Order items insert error:', itemsError);
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return res.status(500).json({
        error: 'Failed to create order items',
        detail: itemsError.message,
        code: itemsError.code,
      });
    }

    console.log('[create-order] Order items inserted');

    try {
      const vercelUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : 'http://localhost:3000';

      console.log('[create-order] Calling email endpoint:', `${vercelUrl}/api/send-order-email`);

      const emailResponse = await fetch(`${vercelUrl}/api/send-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      console.log('[create-order] Email response status:', emailResponse.status);

      if (emailResponse.ok) {
        await supabaseAdmin.from('orders').update({ email_sent: true }).eq('id', order.id);
      }
    } catch (emailError: any) {
      console.error('[create-order] Email sending failed:', emailError?.message || emailError);
    }

    const { data: completeOrder } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single();

    console.log('[create-order] API completed successfully');

    return res.status(201).json({ order: completeOrder });
  } catch (error: any) {
    console.error('[create-order] FATAL:', error?.message || error);
    console.error('[create-order] Stack:', error?.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
    });
  }
}
