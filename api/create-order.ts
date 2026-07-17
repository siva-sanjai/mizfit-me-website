import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './_lib/supabase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    const year = new Date().getFullYear();
    const { count: totalOrders, error: countError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const currentCount = totalOrders || 0;
    const orderNumber = `ORD-${year}-${String(currentCount + 1).padStart(5, '0')}`;

    if (uploaded_designs && uploaded_designs.length > 0) {
      for (const design of uploaded_designs) {
        if (!design.storage_path) continue;
        const { data: fileData } = await supabaseAdmin.storage
          .from('customer-designs')
          .exists(design.storage_path);

        if (!fileData) {
          return res.status(400).json({ error: `Design file not found: ${design.file_name}` });
        }
      }
    }

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
      console.error('Order insert error:', orderError);
      return res.status(500).json({ error: 'Failed to create order' });
    }

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
      console.error('Order items insert error:', itemsError);
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ error: 'Failed to create order items' });
    }

    try {
      const emailResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/send-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (emailResponse.ok) {
        await supabaseAdmin.from('orders').update({ email_sent: true }).eq('id', order.id);
      } else {
        await supabaseAdmin.from('orders').update({ email_sent: false }).eq('id', order.id);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      await supabaseAdmin.from('orders').update({ email_sent: false }).eq('id', order.id);
    }

    const { data: completeOrder } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single();

    return res.status(201).json({ order: completeOrder });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
