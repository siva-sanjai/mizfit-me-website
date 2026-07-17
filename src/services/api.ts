import type { Order, OrderWithItems, OrderStatus, OrderStats } from '@/types';
import { supabase } from './supabase';

const API_BASE = '/api';

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export async function createOrder(orderData: {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  payment_method: string;
  total_amount: number;
  items: Array<{
    product_id: string;
    product_name: string;
    color: string;
    size: string;
    quantity: number;
    print_side: string;
    design_file: File | null;
  }>;
}): Promise<{ order: OrderWithItems }> {
  // First upload all design files to Supabase Storage
  const uploadedDesigns = await Promise.all(
    orderData.items.map(async (item, index) => {
      if (!item.design_file) {
        return { file_name: null, storage_path: null };
      }

      const fileExt = item.design_file.name.split('.').pop();
      const fileName = `${Date.now()}-${index}.${fileExt}`;
      const storagePath = `temp/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('customer-designs')
        .upload(storagePath, item.design_file, {
          contentType: item.design_file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload design: ${uploadError.message}`);
      }

      return {
        file_name: item.design_file.name,
        storage_path: storagePath,
      };
    })
  );

  // Then send order data as JSON
  const response = await fetch(`${API_BASE}/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      address: orderData.address,
      city: orderData.city,
      state: orderData.state,
      postal_code: orderData.postal_code,
      payment_method: orderData.payment_method,
      total_amount: orderData.total_amount,
      items: orderData.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        print_side: item.print_side,
        item_price: orderData.total_amount / orderData.items.reduce((s, i) => s + i.quantity, 0),
      })),
      uploaded_designs: uploadedDesigns,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
}

export async function getOrders(search?: string, status?: string): Promise<OrderWithItems[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/get-orders?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await response.json();
  return data.map((order: any) => ({
    ...order,
    items: order.order_items || [],
  }));
}

export async function updateOrder(
  orderId: string,
  data: { order_status?: OrderStatus; payment_status?: string }
): Promise<Order> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/update-order`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ order_id: orderId, ...data }),
  });

  if (!response.ok) {
    throw new Error('Failed to update order');
  }

  return response.json();
}

export async function getOrderStats(): Promise<OrderStats> {
  const orders = await getOrders();
  const total = orders.length;
  const pending = orders.filter(o => o.order_status === 'pending').length;
  const printing = orders.filter(o => o.order_status === 'printing').length;
  const completed = orders.filter(o => o.order_status === 'delivered').length;
  const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return { total, pending, printing, completed, totalSales };
}
