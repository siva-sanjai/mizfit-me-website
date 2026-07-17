import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '@/services/api';
import { formatPrice, formatDate } from '@/utils/helpers';
import type { OrderWithItems } from '@/types';
import { ORDER_STATUSES } from '@/types';

const ORDER_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fff7df', color: '#8a6400' },
  confirmed: { bg: '#eaf2ff', color: '#2459a6' },
  printing: { bg: '#eaf2ff', color: '#2459a6' },
  packed: { bg: '#eaf2ff', color: '#2459a6' },
  shipped: { bg: '#eaf2ff', color: '#2459a6' },
  delivered: { bg: '#e8f6ed', color: '#237344' },
  cancelled: { bg: '#fdecec', color: '#a63b3b' },
};

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  paid: { bg: '#e8f6ed', color: '#237344' },
  unpaid: { bg: '#fff7df', color: '#8a6400' },
  failed: { bg: '#fdecec', color: '#a63b3b' },
  refunded: { bg: '#f5f5f3', color: 'rgba(0,0,0,0.5)' },
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  ...ORDER_STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mounted, setMounted] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        o =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter(o => o.order_status === statusFilter);
    }

    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [orders, search, statusFilter]);

  const anim = (delay: number) =>
    mounted
      ? { opacity: 1, transform: 'translateY(0)', transition: `opacity 0.4s ease, transform 0.4s ease ${delay}ms` }
      : { opacity: 0, transform: 'translateY(10px)' };

  if (loading) {
    return (
      <div ref={pageRef}>
        <style>{`
          .ao-skel { background: #e8e8e6; border-radius: 8px; animation: aoPulse 1.5s ease-in-out infinite; }
          @keyframes aoPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
        <div className="ao-skel" style={{ width: 140, height: 10, marginBottom: 14 }} />
        <div className="ao-skel" style={{ width: 200, height: 28, marginBottom: 12 }} />
        <div className="ao-skel" style={{ width: 320, height: 12, marginBottom: 40 }} />
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div className="ao-skel" style={{ flex: 1, height: 48, borderRadius: 10 }} />
          <div className="ao-skel" style={{ width: 180, height: 48, borderRadius: 10 }} />
        </div>
        <div className="ao-skel" style={{ height: 400, borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <div ref={pageRef}>
      <style>{`
        .ao-header-label {
          font-size: 8px; font-weight: 650; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(0,0,0,0.4);
        }
        .ao-header-title {
          margin-top: 12px; font-size: clamp(36px, 4vw, 56px); font-weight: 750;
          line-height: 1; letter-spacing: -0.05em; color: #111111;
        }
        .ao-header-desc {
          margin-top: 12px; font-size: 13px; line-height: 1.5; color: rgba(0,0,0,0.48);
        }
        .ao-header { margin-bottom: 40px; }

        .ao-toolbar {
          display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
        }
        .ao-search-wrap { position: relative; flex: 1; }
        .ao-search-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          width: 17px; height: 17px; color: rgba(0,0,0,0.35);
        }
        .ao-search-input {
          width: 100%; height: 48px; padding: 0 16px 0 46px;
          background: #ffffff; border: 1px solid rgba(0,0,0,0.10); border-radius: 10px;
          font-size: 13px; color: #111111; outline: none; box-sizing: border-box;
          transition: border-color 0.2s ease;
        }
        .ao-search-input:focus { border-color: rgba(0,0,0,0.4); }
        .ao-search-input::placeholder { color: rgba(0,0,0,0.3); }
        .ao-status-filter {
          width: 180px; height: 48px; padding: 0 16px; background: #ffffff;
          border: 1px solid rgba(0,0,0,0.10); border-radius: 10px; font-size: 12px;
          font-weight: 500; color: #111111; outline: none; box-sizing: border-box;
          transition: border-color 0.2s ease; cursor: pointer;
        }
        .ao-status-filter:focus { border-color: rgba(0,0,0,0.4); }

        .ao-container {
          background: #ffffff; border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px; overflow: hidden; min-height: 400px;
        }

        .ao-empty {
          min-height: 400px; display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center; padding: 40px 20px;
        }
        .ao-empty-icon {
          width: 54px; height: 54px; border-radius: 50%; background: #f5f5f3;
          display: flex; align-items: center; justify-content: center;
        }
        .ao-empty-icon svg { width: 22px; height: 22px; color: rgba(0,0,0,0.4); }
        .ao-empty-title { font-size: 15px; font-weight: 600; margin-top: 18px; }
        .ao-empty-desc { font-size: 12px; color: rgba(0,0,0,0.45); margin-top: 7px; }

        .ao-table { width: 100%; min-width: 900px; }
        .ao-table th {
          height: 48px; background: #fafaf8; border-bottom: 1px solid rgba(0,0,0,0.08);
          font-size: 8px; font-weight: 650; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(0,0,0,0.42); text-align: left; padding: 0 16px; white-space: nowrap;
        }
        .ao-table td { padding: 0 16px; font-size: 12px; color: #111111; }
        .ao-table tr { min-height: 72px; border-bottom: 1px solid rgba(0,0,0,0.07); }
        .ao-table tr:last-child { border-bottom: none; }
        .ao-table tbody tr { transition: background 0.2s ease; }
        .ao-table tbody tr:hover { background: #fafaf8; }
        .ao-table-wrap { overflow-x: auto; }

        .ao-badge {
          display: inline-flex; align-items: center; height: 26px; padding: 0 10px;
          border-radius: 999px; font-size: 9px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .ao-view-btn {
          height: 34px; padding: 0 12px; border: 1px solid rgba(0,0,0,0.12); border-radius: 7px;
          background: transparent; font-size: 10px; font-weight: 600; color: #111111;
          cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .ao-view-btn:hover { background: #111111; color: #ffffff; }
        .ao-view-btn:hover svg { stroke: #ffffff; }
        .ao-view-btn svg { transition: stroke 0.2s ease; }

        /* Mobile order cards */
        .ao-mobile-cards { display: none; }

        @media (max-width: 767px) {
          .ao-table-wrap { display: none; }
          .ao-mobile-cards { display: block; }
          .ao-mobile-card {
            padding: 18px; border-bottom: 1px solid rgba(0,0,0,0.08); background: #ffffff;
          }
          .ao-mobile-card:last-child { border-bottom: none; }
          .ao-mobile-top {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
          }
          .ao-mobile-order {
            font-size: 13px; font-weight: 600; color: #111111; text-decoration: none;
          }
          .ao-mobile-cust { margin-top: 4px; font-size: 12px; color: rgba(0,0,0,0.55); }
          .ao-mobile-date { font-size: 11px; color: rgba(0,0,0,0.4); margin-top: 2px; }
          .ao-mobile-details {
            display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px; margin-top: 20px;
          }
          .ao-mobile-dl { }
          .ao-mobile-dl-label {
            font-size: 7px; font-weight: 650; letter-spacing: 0.14em;
            text-transform: uppercase; color: rgba(0,0,0,0.38);
          }
          .ao-mobile-dl-value { margin-top: 5px; font-size: 12px; font-weight: 550; color: #111111; }
          .ao-mobile-view {
            width: 100%; height: 42px; margin-top: 20px; border: 1px solid rgba(0,0,0,0.12);
            border-radius: 8px; background: transparent; font-size: 11px; font-weight: 600;
            color: #111111; cursor: pointer; text-decoration: none; display: flex;
            align-items: center; justify-content: center; gap: 4px;
            transition: background 0.2s ease, color 0.2s ease; box-sizing: border-box;
          }
          .ao-mobile-view:hover { background: #111111; color: #ffffff; }
          .ao-mobile-view:hover svg { stroke: #ffffff; }
          .ao-mobile-view svg { transition: stroke 0.2s ease; }
        }

        @media (max-width: 600px) {
          .ao-toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
          .ao-search-input { height: 46px; }
          .ao-status-filter { width: 100%; height: 46px; }
        }

        @media (prefers-reduced-motion: reduce) { .ao-container { transition: none !important; } }
      `}</style>

      <div className="ao-header" style={anim(0)}>
        <p className="ao-header-label">ADMIN / ORDERS</p>
        <h1 className="ao-header-title">Orders</h1>
        <p className="ao-header-desc">View and manage customer orders.</p>
      </div>

      <div className="ao-toolbar" style={anim(120)}>
        <div className="ao-search-wrap">
          <svg className="ao-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number or customer name"
            className="ao-search-input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="ao-status-filter"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="ao-container" style={anim(240)}>
        {/* Empty state: no orders at all */}
        {orders.length === 0 ? (
          <div className="ao-empty">
            <div className="ao-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="ao-empty-title">No orders found</p>
            <p className="ao-empty-desc">Orders will appear here when customers complete checkout.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty state: search/filter yielded no results */
          <div className="ao-empty">
            <div className="ao-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="ao-empty-title">No matching orders</p>
            <p className="ao-empty-desc">Try changing your search or status filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="ao-table-wrap">
              <table className="ao-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'center' }}>Payment</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Date</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const sc = ORDER_STATUS_COLORS[order.order_status];
                    const pc = PAYMENT_STATUS_COLORS[order.payment_status];
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 550 }}>{order.order_number}</td>
                        <td style={{ color: 'rgba(0,0,0,0.6)' }}>{order.customer_name}</td>
                        <td style={{ color: 'rgba(0,0,0,0.45)' }}>{order.items?.length || 0}</td>
                        <td style={{ textAlign: 'right', fontWeight: 550 }}>{formatPrice(order.total_amount)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="ao-badge" style={{ background: pc?.bg || '#f5f5f3', color: pc?.color || 'rgba(0,0,0,0.5)' }}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="ao-badge" style={{ background: sc?.bg || '#f5f5f3', color: sc?.color || 'rgba(0,0,0,0.5)' }}>
                            {order.order_status}
                          </span>
                        </td>
                        <td style={{ color: 'rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>{formatDate(order.created_at)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Link to={`/admin/orders/${order.id}`} className="ao-view-btn">
                            View
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="7" y1="17" x2="17" y2="7" />
                              <polyline points="7 7 17 7 17 17" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="ao-mobile-cards">
              {filteredOrders.map(order => {
                const sc = ORDER_STATUS_COLORS[order.order_status];
                return (
                  <div key={order.id} className="ao-mobile-card">
                    <div className="ao-mobile-top">
                      <div>
                        <Link to={`/admin/orders/${order.id}`} className="ao-mobile-order">{order.order_number}</Link>
                        <p className="ao-mobile-cust">{order.customer_name}</p>
                        <p className="ao-mobile-date">{formatDate(order.created_at)}</p>
                      </div>
                      <span className="ao-badge" style={{ background: sc?.bg || '#f5f5f3', color: sc?.color || 'rgba(0,0,0,0.5)', flexShrink: 0 }}>
                        {order.order_status}
                      </span>
                    </div>
                    <div className="ao-mobile-details">
                      <div className="ao-mobile-dl">
                        <p className="ao-mobile-dl-label">Items</p>
                        <p className="ao-mobile-dl-value">{order.items?.length || 0}</p>
                      </div>
                      <div className="ao-mobile-dl">
                        <p className="ao-mobile-dl-label">Total</p>
                        <p className="ao-mobile-dl-value">{formatPrice(order.total_amount)}</p>
                      </div>
                      <div className="ao-mobile-dl">
                        <p className="ao-mobile-dl-label">Payment</p>
                        <p className="ao-mobile-dl-value" style={{ textTransform: 'capitalize' }}>{order.payment_status}</p>
                      </div>
                      <div className="ao-mobile-dl">
                        <p className="ao-mobile-dl-label">Status</p>
                        <p className="ao-mobile-dl-value" style={{ textTransform: 'capitalize' }}>{order.order_status}</p>
                      </div>
                    </div>
                    <Link to={`/admin/orders/${order.id}`} className="ao-mobile-view">
                      View Order
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
