import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { getOrders, updateOrder } from '@/services/api';
import { formatPrice, formatDate, sanitizeInput } from '@/utils/helpers';
import type { OrderWithItems, OrderStatus, OrderItem } from '@/types';
import { ORDER_STATUSES } from '@/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  printing: 'Printing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const PAYMENT_BADGE: Record<string, { bg: string; color: string }> = {
  paid: { bg: '#e8f6ed', color: '#237344' },
  unpaid: { bg: '#fff7df', color: '#8a6400' },
  failed: { bg: '#fdecec', color: '#a63b3b' },
  refunded: { bg: '#f5f5f3', color: 'rgba(0,0,0,0.5)' },
};

const TIMELINE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'printing', 'packed', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [designUrls, setDesignUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orders = await getOrders();
        const found = orders.find(o => o.id === id);
        if (!found) {
          setError('Order not found.');
        } else {
          setOrder(found);
          setSelectedStatus(found.order_status);
        }
      } catch {
        setError('Failed to load order.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order) return;

    const itemsWithDesigns = order.items.filter(
      (item): item is OrderItem & { design_storage_path: string } =>
        !!item.design_storage_path
    );

    if (itemsWithDesigns.length === 0) return;

    const fetchUrls = async () => {
      const urls: Record<string, string> = {};
      for (const item of itemsWithDesigns) {
        const { data } = await supabase.storage
          .from('customer-designs')
          .createSignedUrl(item.design_storage_path, 60 * 60);
        if (data) {
          urls[item.id] = data.signedUrl;
        }
      }
      setDesignUrls(urls);
    };
    fetchUrls();
  }, [order]);

  const handleUpdateStatus = async () => {
    if (!order || selectedStatus === order.order_status) return;

    setUpdating(true);
    setFeedback(null);

    try {
      await updateOrder(order.id, { order_status: selectedStatus });
      setOrder({ ...order, order_status: selectedStatus });
      setFeedback({ type: 'success', message: 'Order status updated successfully.' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update order status.' });
      setSelectedStatus(order.order_status);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <style>{`
          .od-skel { background: #e8e8e6; border-radius: 8px; animation: odPulse 1.5s ease-in-out infinite; }
          @keyframes odPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
        <div className="od-skel" style={{ width: 100, height: 10, marginBottom: 14 }} />
        <div className="od-skel" style={{ width: 240, height: 28, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div className="od-skel" style={{ flex: 2, minWidth: 300, height: 500, borderRadius: 12 }} />
          <div className="od-skel" style={{ flex: 1, minWidth: 240, height: 500, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <style>{`
          .od-back {
            display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px;
            border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; background: transparent;
            font-size: 11px; font-weight: 600; color: #111; cursor: pointer; text-decoration: none;
            transition: background 0.2s ease, color 0.2s ease; margin-bottom: 24px;
          }
          .od-back:hover { background: #111; color: #fff; }
          .od-back:hover svg { stroke: #fff; }
          .od-back svg { transition: stroke 0.2s ease; }
          .od-error { background: #fdecec; border: 1px solid #f5c6cb; border-radius: 10px; padding: 16px 20px; }
          .od-error p { font-size: 13px; color: #a63b3b; margin: 0; }
        `}</style>
        <button onClick={() => navigate('/admin/orders')} className="od-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Orders
        </button>
        <div className="od-error">
          <p>{error || 'Order not found.'}</p>
        </div>
      </div>
    );
  }

  const currentIndex = TIMELINE_STATUSES.indexOf(order.order_status as OrderStatus);
  const isCancelled = order.order_status === 'cancelled';

  return (
    <div>
      <style>{`
        .od-back {
          display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px;
          border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; background: transparent;
          font-size: 11px; font-weight: 600; color: #111; cursor: pointer; text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease; margin-bottom: 24px;
        }
        .od-back:hover { background: #111; color: #fff; }
        .od-back:hover svg { stroke: #fff; }
        .od-back svg { transition: stroke 0.2s ease; }

        .od-header-label {
          font-size: 8px; font-weight: 650; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(0,0,0,0.4);
        }
        .od-header-title {
          font-size: clamp(30px, 3.5vw, 48px); font-weight: 750; line-height: 1.1; letter-spacing: -0.04em; color: #111111;
        }
        .od-header-date { font-size: 13px; color: rgba(0,0,0,0.45); margin-top: 6px; }
        .od-header { margin-bottom: 32px; }

        .od-feedback {
          padding: 14px 18px; border-radius: 10px; font-size: 13px; margin-bottom: 24px;
        }
        .od-feedback.success { background: #e8f6ed; border: 1px solid #b8e6cc; color: #237344; }
        .od-feedback.error { background: #fdecec; border: 1px solid #f5c6cb; color: #a63b3b; }

        .od-grid { display: grid; grid-template-columns: 1.7fr 1fr; gap: 24px; align-items: start; }

        .od-card {
          background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 24px; margin-bottom: 20px;
        }
        .od-card-title {
          font-size: 13px; font-weight: 650; letter-spacing: -0.01em; color: #111; margin-bottom: 16px;
        }

        .od-info-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .od-info-label { font-size: 8px; font-weight: 650; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(0,0,0,0.4); }
        .od-info-value { margin-top: 5px; font-size: 13px; color: #111; }

        .od-address { font-size: 13px; color: rgba(0,0,0,0.65); line-height: 1.5; }

        .od-item {
          display: flex; align-items: flex-start; gap: 14px; padding: 16px 0;
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .od-item:last-child { border-bottom: none; padding-bottom: 0; }
        .od-item-img {
          width: 60px; height: 60px; border-radius: 8px; background: #f5f5f3;
          overflow: hidden; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.06);
        }
        .od-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .od-item-info { flex: 1; min-width: 0; }
        .od-item-name { font-size: 13px; font-weight: 550; color: #111; }
        .od-item-meta { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 5px; font-size: 11px; color: rgba(0,0,0,0.5); }
        .od-item-color {
          display: inline-flex; align-items: center; gap: 4px;
        }
        .od-item-swatch {
          width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.12); display: inline-block;
        }
        .od-item-price { font-size: 13px; font-weight: 550; white-space: nowrap; color: #111; }
        .od-item-dl {
          display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: rgba(0,0,0,0.5);
          text-decoration: none; margin-top: 4px; transition: color 0.2s ease;
        }
        .od-item-dl:hover { color: #111; }

        .od-total {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 16px; margin-top: 12px; border-top: 1px solid rgba(0,0,0,0.12);
        }
        .od-total-label { font-size: 13px; font-weight: 600; color: #111; }
        .od-total-value { font-size: 20px; font-weight: 700; color: #111; letter-spacing: -0.03em; }

        .od-pay-grid { display: flex; flex-wrap: wrap; gap: 16px 28px; }
        .od-pay-label { font-size: 8px; font-weight: 650; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(0,0,0,0.4); }
        .od-pay-value { margin-top: 5px; font-size: 13px; color: #111; }

        .od-badge {
          display: inline-flex; align-items: center; height: 26px; padding: 0 10px;
          border-radius: 999px; font-size: 9px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.06em;
        }

        .od-status-select {
          width: 100%; height: 48px; padding: 0 14px; background: #ffffff;
          border: 1px solid rgba(0,0,0,0.10); border-radius: 10px; font-size: 13px;
          color: #111111; outline: none; box-sizing: border-box; cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .od-status-select:focus { border-color: rgba(0,0,0,0.4); }

        .od-update-btn {
          width: 100%; height: 48px; margin-top: 12px; background: #111111; color: #ffffff;
          border: none; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .od-update-btn:hover { opacity: 0.85; }
        .od-update-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .od-cancelled-banner {
          display: flex; align-items: center; gap: 12px;
          background: #fdecec; border: 1px solid #f5c6cb; border-radius: 10px;
          padding: 14px 18px; margin-bottom: 20px;
        }
        .od-cancelled-icon {
          width: 24px; height: 24px; border-radius: 50%; background: #f5c6cb;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .od-cancelled-icon svg { width: 12px; height: 12px; color: #a63b3b; }
        .od-cancelled-text { font-size: 12px; font-weight: 600; color: #a63b3b; }

        .od-timeline { position: relative; }
        .od-timeline-line {
          position: absolute; left: 11px; top: 4px; bottom: 4px;
          width: 2px; background: rgba(0,0,0,0.10);
        }
        .od-timeline-items { display: flex; flex-direction: column; gap: 20px; }
        .od-tl-item { display: flex; align-items: flex-start; gap: 12px; position: relative; }
        .od-tl-dot {
          width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; z-index: 1;
          font-size: 10px; font-weight: 600; transition: background 0.3s ease, color 0.3s ease;
        }
        .od-tl-dot.completed { background: #111111; color: #fff; }
        .od-tl-dot.pending { background: #f5f5f3; color: rgba(0,0,0,0.4); }
        .od-tl-dot svg { width: 12px; height: 12px; }
        .od-tl-label { font-size: 13px; font-weight: 500; padding-top: 2px; }
        .od-tl-label.completed { color: #111; }
        .od-tl-label.pending { color: rgba(0,0,0,0.4); }
        .od-tl-current-badge {
          display: inline-flex; align-items: center; height: 20px; padding: 0 8px;
          border-radius: 999px; font-size: 8px; font-weight: 650; margin-left: 6px;
          background: #eaf2ff; color: #2459a6; text-transform: uppercase; letter-spacing: 0.06em;
        }

        @media (max-width: 1023px) {
          .od-grid { grid-template-columns: 1fr; }
          .od-info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 600px) {
          .od-info-grid { grid-template-columns: 1fr; gap: 12px; }
          .od-card { padding: 18px; }
          .od-item { gap: 10px; }
          .od-item-img { width: 48px; height: 48px; }
        }

        @media (prefers-reduced-motion: reduce) { .od-card, .od-back, .od-update-btn { transition: none !important; } }
      `}</style>

      <button onClick={() => navigate('/admin/orders')} className="od-back">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Orders
      </button>

      <div className="od-header">
        <p className="od-header-label">ADMIN / ORDER DETAIL</p>
        <h1 className="od-header-title">Order #{order.order_number}</h1>
        <p className="od-header-date">Placed on {formatDate(order.created_at)}</p>
      </div>

      {feedback && (
        <div className={`od-feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="od-grid">
        <div>
          {/* Customer Information */}
          <div className="od-card">
            <h2 className="od-card-title">Customer Information</h2>
            <div className="od-info-grid">
              <div>
                <p className="od-info-label">Name</p>
                <p className="od-info-value">{sanitizeInput(order.customer_name)}</p>
              </div>
              <div>
                <p className="od-info-label">Email</p>
                <p className="od-info-value">{order.customer_email}</p>
              </div>
              <div>
                <p className="od-info-label">Phone</p>
                <p className="od-info-value">{order.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="od-card">
            <h2 className="od-card-title">Delivery Address</h2>
            <p className="od-address">
              {sanitizeInput(order.address)}, {sanitizeInput(order.city)}, {sanitizeInput(order.state)} &mdash; {order.postal_code}
            </p>
          </div>

          {/* Order Items */}
          <div className="od-card">
            <h2 className="od-card-title">Order Items</h2>
            {order.items.map(item => (
              <div key={item.id} className="od-item">
                {item.design_storage_path && designUrls[item.id] && (
                  <div className="od-item-img">
                    <img src={designUrls[item.id]} alt="Design preview" />
                  </div>
                )}
                <div className="od-item-info">
                  <p className="od-item-name">{item.product_name}</p>
                  <div className="od-item-meta">
                    <span className="od-item-color">
                      <span className="od-item-swatch" style={{ backgroundColor: item.color }} />
                      {item.color}
                    </span>
                    <span>Size: {item.size}</span>
                    <span>Qty: {item.quantity}</span>
                    <span className="capitalize">Print: {item.print_side}</span>
                  </div>
                  {item.design_storage_path && designUrls[item.id] && (
                    <a href={designUrls[item.id]} target="_blank" rel="noopener noreferrer" className="od-item-dl">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download Design
                    </a>
                  )}
                </div>
                <p className="od-item-price">{formatPrice(item.item_price * item.quantity)}</p>
              </div>
            ))}
            <div className="od-total">
              <span className="od-total-label">Total</span>
              <span className="od-total-value">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="od-card">
            <h2 className="od-card-title">Payment</h2>
            <div className="od-pay-grid">
              <div>
                <p className="od-pay-label">Method</p>
                <p className="od-pay-value" style={{ textTransform: 'capitalize' }}>{order.payment_method}</p>
              </div>
              <div>
                <p className="od-pay-label">Status</p>
                <div style={{ marginTop: 5 }}>
                  <span className="od-badge" style={PAYMENT_BADGE[order.payment_status] || { background: '#f5f5f3', color: 'rgba(0,0,0,0.5)' }}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
              <div>
                <p className="od-pay-label">Amount</p>
                <p className="od-pay-value" style={{ fontWeight: 600 }}>{formatPrice(order.total_amount)}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Order Status */}
          <div className="od-card">
            <h2 className="od-card-title">Order Status</h2>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as OrderStatus)}
              className="od-status-select"
            >
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={updating || selectedStatus === order.order_status}
              className="od-update-btn"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          {/* Order Timeline */}
          <div className="od-card">
            <h2 className="od-card-title">Order Timeline</h2>
            {isCancelled && (
              <div className="od-cancelled-banner">
                <div className="od-cancelled-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <div>
                  <p className="od-cancelled-text">Order Cancelled</p>
                  <p style={{ fontSize: 11, color: 'rgba(166,59,59,0.7)', marginTop: 2 }}>This order has been cancelled.</p>
                </div>
              </div>
            )}
            <div className="od-timeline">
              <div className="od-timeline-line" />
              <div className="od-timeline-items">
                {TIMELINE_STATUSES.map((status, idx) => {
                  const isCompleted = idx <= currentIndex;
                  const isCurrent = idx === currentIndex;
                  return (
                    <div key={status} className="od-tl-item">
                      <div className={`od-tl-dot ${isCompleted ? 'completed' : 'pending'}`}>
                        {isCompleted ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <div>
                        <span className={`od-tl-label ${isCompleted ? 'completed' : 'pending'}`}>
                          {STATUS_LABELS[status]}
                        </span>
                        {isCurrent && !isCancelled && (
                          <span className="od-tl-current-badge">Current</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
