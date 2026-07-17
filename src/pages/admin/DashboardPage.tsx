import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, getOrderStats } from '@/services/api';
import { formatPrice, formatDate } from '@/utils/helpers';
import type { OrderWithItems, OrderStats } from '@/types';

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

export default function DashboardPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          getOrderStats(),
          getOrders(),
        ]);
        setStats(statsData);
        setRecentOrders(
          [...ordersData]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        );
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const anim = (delay: number) =>
    mounted
      ? { opacity: 1, transform: 'translateY(0)', transition: `opacity 0.4s ease, transform 0.4s ease ${delay}ms` }
      : { opacity: 0, transform: 'translateY(10px)' };

  if (loading) {
    return (
      <div ref={pageRef}>
        <style>{`
          .ad-skel { background: #e8e8e6; border-radius: 8px; animation: adPulse 1.5s ease-in-out infinite; }
          @keyframes adPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
        <div className="ad-skel" style={{ width: 160, height: 10, marginBottom: 14 }} />
        <div className="ad-skel" style={{ width: 260, height: 28, marginBottom: 12 }} />
        <div className="ad-skel" style={{ width: 360, height: 12, marginBottom: 40 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {[1,2,3].map(i => <div key={i} className="ad-skel" style={{ height: 150, borderRadius: 12 }} />)}
        </div>
        <div className="ad-skel" style={{ height: 400, borderRadius: 12 }} />
      </div>
    );
  }

  const summaryCards = stats ? [
    { label: 'TOTAL ORDERS', value: String(stats.total) },
    { label: 'NEW ORDERS', value: String(stats.pending) },
    { label: 'COMPLETED', value: String(stats.completed) },
  ] : [];

  return (
    <div ref={pageRef}>
      <style>{`
        .ad-header-label {
          font-size: 8px; font-weight: 650; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(0,0,0,0.4);
        }
        .ad-header-title {
          margin-top: 12px; font-size: clamp(36px, 4vw, 56px); font-weight: 750;
          line-height: 1; letter-spacing: -0.05em; color: #111111;
        }
        .ad-header-desc {
          margin-top: 12px; font-size: 13px; line-height: 1.5; color: rgba(0,0,0,0.48);
        }
        .ad-header { margin-bottom: 40px; }

        .ad-summary {
          display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 32px;
        }
        .ad-card {
          background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;
          min-height: 150px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;
        }
        .ad-card-label {
          font-size: 9px; font-weight: 650; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(0,0,0,0.42);
        }
        .ad-card-value {
          font-size: clamp(38px, 4vw, 58px); font-weight: 700; line-height: 1; letter-spacing: -0.05em; color: #111111;
        }

        .ad-recent {
          background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden;
        }
        .ad-recent-header {
          min-height: 70px; padding: 0 24px; display: flex; align-items: center;
          justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .ad-recent-title { font-size: 16px; font-weight: 650; letter-spacing: -0.02em; }
        .ad-recent-link {
          font-size: 11px; font-weight: 600; color: rgba(0,0,0,0.55); text-decoration: none;
          display: inline-flex; align-items: center; gap: 4px; transition: color 0.2s ease;
        }
        .ad-recent-link:hover { color: #111111; }

        .ad-empty {
          min-height: 280px; display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center; padding: 40px 20px;
        }
        .ad-empty-icon {
          width: 54px; height: 54px; border-radius: 50%; background: #f5f5f3;
          display: flex; align-items: center; justify-content: center;
        }
        .ad-empty-icon svg { width: 22px; height: 22px; color: rgba(0,0,0,0.4); }
        .ad-empty-title { font-size: 15px; font-weight: 600; margin-top: 18px; }
        .ad-empty-desc { font-size: 12px; color: rgba(0,0,0,0.45); margin-top: 7px; }

        .ad-table { width: 100%; }
        .ad-table th {
          height: 48px; background: #fafaf8; border-bottom: 1px solid rgba(0,0,0,0.08);
          font-size: 8px; font-weight: 650; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(0,0,0,0.42); text-align: left; padding: 0 16px; white-space: nowrap;
        }
        .ad-table td { padding: 0 16px; font-size: 12px; color: #111111; }
        .ad-table tr { min-height: 72px; border-bottom: 1px solid rgba(0,0,0,0.07); }
        .ad-table tr:last-child { border-bottom: none; }
        .ad-table tbody tr { transition: background 0.2s ease; }
        .ad-table tbody tr:hover { background: #fafaf8; }

        .ad-badge {
          display: inline-flex; align-items: center; height: 26px; padding: 0 10px;
          border-radius: 999px; font-size: 9px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .ad-view-btn {
          height: 34px; padding: 0 12px; border: 1px solid rgba(0,0,0,0.12); border-radius: 7px;
          background: transparent; font-size: 10px; font-weight: 600; color: #111111;
          cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .ad-view-btn:hover { background: #111111; color: #ffffff; }
        .ad-view-btn:hover svg { stroke: #ffffff; }
        .ad-view-btn svg { transition: stroke 0.2s ease; }

        .ad-table-wrap { overflow-x: auto; }

        @media (max-width: 600px) {
          .ad-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .ad-summary .ad-card:first-child { grid-column: span 2; }
          .ad-card { min-height: 125px; padding: 18px; }
          .ad-card-value { font-size: 38px; }
          .ad-recent-header { padding: 0 16px; min-height: 62px; }
          .ad-recent-title { font-size: 15px; }
          .ad-recent-link { font-size: 10px; }
          .ad-empty { min-height: 260px; padding: 32px 16px; }
        }

        @media (prefers-reduced-motion: reduce) { .ad-card, .ad-recent, .ad-empty { transition: none !important; } }
      `}</style>

      <div className="ad-header" style={anim(0)}>
        <p className="ad-header-label">ADMIN / OVERVIEW</p>
        <h1 className="ad-header-title">Dashboard</h1>
        <p className="ad-header-desc">Overview of your MIZFIT store and recent orders.</p>
      </div>

      {stats && (
        <div className="ad-summary">
          {summaryCards.map((card, i) => (
            <div key={card.label} className="ad-card" style={anim(60 + i * 60)}>
              <p className="ad-card-label">{card.label}</p>
              <p className="ad-card-value">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="ad-recent" style={anim(300)}>
        <div className="ad-recent-header">
          <h2 className="ad-recent-title">Recent Orders</h2>
          <Link to="/admin/orders" className="ad-recent-link">
            View All Orders
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="ad-empty">
            <div className="ad-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="ad-empty-title">No orders yet</p>
            <p className="ad-empty-desc">Customer orders will appear here once they place an order.</p>
          </div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Payment</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const sc = ORDER_STATUS_COLORS[order.order_status];
                  const pc = PAYMENT_STATUS_COLORS[order.payment_status];
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 550 }}>
                        <Link to={`/admin/orders/${order.id}`} style={{ color: '#111', textDecoration: 'none' }}>
                          {order.order_number}
                        </Link>
                      </td>
                      <td style={{ color: 'rgba(0,0,0,0.6)' }}>{order.customer_name}</td>
                      <td style={{ color: 'rgba(0,0,0,0.45)' }}>{formatDate(order.created_at)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 550 }}>{formatPrice(order.total_amount)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="ad-badge" style={{ background: pc?.bg || '#f5f5f3', color: pc?.color || 'rgba(0,0,0,0.5)' }}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="ad-badge" style={{ background: sc?.bg || '#f5f5f3', color: sc?.color || 'rgba(0,0,0,0.5)' }}>
                          {order.order_status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Link to={`/admin/orders/${order.id}`} className="ad-view-btn">
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
        )}
      </div>
    </div>
  );
}
