import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from './_lib/supabase-admin';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.order_items || order.order_items.length === 0) {
      return res.status(400).json({ error: 'Order has no items' });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPass || !adminEmail) {
      console.warn('SMTP not fully configured');
      return res.status(200).json({ message: 'SMTP not configured, email skipped', email_sent: false });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const itemsHtml = order.order_items.map((item: any) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee">${item.product_name}</td>
        <td style="padding:12px;border-bottom:1px solid #eee">${item.color}</td>
        <td style="padding:12px;border-bottom:1px solid #eee">${item.size}</td>
        <td style="padding:12px;border-bottom:1px solid #eee">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-transform:capitalize">${item.print_side}</td>
        <td style="padding:12px;border-bottom:1px solid #eee">₹${Number(item.item_price).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;margin:0;padding:0">
        <div style="max-width:600px;margin:0 auto;background:white">
          <div style="background:#1a1a1a;color:white;padding:32px;text-align:center">
            <h1 style="margin:0;font-size:24px;letter-spacing:-0.5px">New Custom T-Shirt Order</h1>
            <p style="margin:8px 0 0;color:#999;font-size:14px">${order.order_number}</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:18px;margin:0 0 16px;color:#1a1a1a">Customer Information</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr><td style="padding:8px 0;color:#666">Name</td><td style="font-weight:600">${order.customer_name}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Email</td><td style="font-weight:600">${order.customer_email}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Phone</td><td style="font-weight:600">${order.customer_phone}</td></tr>
            </table>

            <h2 style="font-size:18px;margin:0 0 16px;color:#1a1a1a">Delivery Address</h2>
            <p style="margin:0 0 24px;line-height:1.6">
              ${order.address}<br>
              ${order.city}, ${order.state} - ${order.postal_code}
            </p>

            <h2 style="font-size:18px;margin:0 0 16px;color:#1a1a1a">Order Items</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <thead>
                <tr style="background:#f8f8f8">
                  <th style="padding:12px;text-align:left;font-size:12px;text-transform:uppercase;color:#666">Product</th>
                  <th style="padding:12px;text-align:left;font-size:12px;text-transform:uppercase;color:#666">Color</th>
                  <th style="padding:12px;text-align:left;font-size:12px;text-transform:uppercase;color:#666">Size</th>
                  <th style="padding:12px;text-align:left;font-size:12px;text-transform:uppercase;color:#666">Qty</th>
                  <th style="padding:12px;text-align:left;font-size:12px;text-transform:uppercase;color:#666">Side</th>
                  <th style="padding:12px;text-align:left;font-size:12px;text-transform:uppercase;color:#666">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <div style="border-top:2px solid #1a1a1a;padding-top:16px;text-align:right;font-size:20px;font-weight:700">
              Total: ₹${Number(order.total_amount).toLocaleString('en-IN')}
            </div>

            <h2 style="font-size:18px;margin:24px 0 16px;color:#1a1a1a">Payment</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr><td style="padding:8px 0;color:#666">Method</td><td style="font-weight:600;text-transform:capitalize">${order.payment_method}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Status</td><td style="font-weight:600;text-transform:capitalize">${order.payment_status}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Date</td><td style="font-weight:600">${new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
            </table>
          </div>
          <div style="background:#f8f8f8;padding:24px;text-align:center;font-size:12px;color:#999">
            InkTee - Premium Custom Printed T-Shirts
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments: any[] = [];
    for (const item of order.order_items) {
      if (item.design_storage_path) {
        try {
          const { data: fileData } = await supabaseAdmin.storage
            .from('customer-designs')
            .download(item.design_storage_path);

          if (fileData) {
            const ext = item.design_file_name?.split('.').pop() || 'png';
            attachments.push({
              filename: `${order.order_number}-${item.product_name.replace(/\s+/g, '-')}-${item.color}-${item.size}.${ext}`,
              content: Buffer.from(await fileData.arrayBuffer()),
            });
          }
        } catch (fileError) {
          console.error(`Failed to attach file for item ${item.id}:`, fileError);
        }
      }
    }

    await transporter.sendMail({
      from: `"InkTee Orders" <${smtpUser}>`,
      to: adminEmail,
      subject: `New Order: ${order.order_number} - ${order.customer_name}`,
      html,
      attachments,
    });

    await supabaseAdmin.from('orders').update({ email_sent: true }).eq('id', orderId);

    return res.status(200).json({ message: 'Email sent successfully', email_sent: true });
  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
