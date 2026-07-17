import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/services/supabase';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setAdminEmail(session.user.email || '');
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setAdminEmail(session.user.email || '');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'alSpin 0.6s linear infinite' }} />
        <style>{`@keyframes alSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/orders', label: 'Orders' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="al-root">
      <style>{`
        .al-root {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #f5f5f3;
        }
        .al-root * { box-sizing: border-box; min-width: 0; }

        .al-sidebar {
          width: 260px;
          min-width: 260px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background: #111111;
          padding: 30px 18px 22px;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        .al-brand { font-size: 24px; font-weight: 800; letter-spacing: -0.05em; color: #fff; text-decoration: none; }
        .al-brand-sub { margin-top: 5px; font-size: 8px; font-weight: 650; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
        .al-brand-wrap { margin-bottom: 48px; }
        .al-nav { display: flex; flex-direction: column; gap: 6px; }
        .al-nav-link {
          height: 46px; padding: 0 14px; border-radius: 9px; display: flex; align-items: center; gap: 12px;
          font-size: 13px; font-weight: 500; text-decoration: none; color: rgba(255,255,255,0.55);
          transition: background 0.25s ease, color 0.25s ease;
        }
        .al-nav-link:hover { background: rgba(255,255,255,0.06); color: #ffffff; }
        .al-nav-link.active { background: rgba(255,255,255,0.10); color: #ffffff; }
        .al-nav-icon { width: 18px; height: 18px; flex-shrink: 0; }
        .al-user { margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.10); }
        .al-user-label { font-size: 8px; font-weight: 650; letter-spacing: 0.18em; color: rgba(255,255,255,0.3); text-transform: uppercase; }
        .al-user-email { margin-top: 8px; font-size: 12px; color: rgba(255,255,255,0.65); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .al-signout {
          margin-top: 18px; width: 100%; height: 42px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
          background: transparent; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 600; cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .al-signout:hover { background: #ffffff; color: #111111; }

        .al-main {
          margin-left: 260px;
          width: calc(100% - 260px);
          min-height: 100vh;
          padding: 48px clamp(32px, 4vw, 72px);
          background: #f5f5f3;
        }
        .al-main-inner { max-width: 1500px; margin: 0 auto; }

        .al-mob-header { display: none; }

        .al-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999;
          opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        }
        .al-overlay.open { opacity: 1; pointer-events: auto; }
        .al-drawer {
          position: fixed; top: 0; left: 0; width: min(82vw, 300px); height: 100dvh;
          background: #111111; z-index: 1000; padding: 24px 18px 22px; display: flex; flex-direction: column;
          transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .al-drawer.open { transform: translateX(0); }
        .al-drawer-close {
          align-self: flex-end; width: 36px; height: 36px; border: none; background: transparent;
          color: rgba(255,255,255,0.7); cursor: pointer; display: flex; align-items: center;
          justify-content: center; margin-bottom: 20px;
        }
        .al-drawer-nav { display: flex; flex-direction: column; gap: 6px; }
        .al-drawer-user { margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.10); }

        @media (max-width: 1024px) {
          .al-sidebar { width: 220px; min-width: 220px; }
          .al-main { margin-left: 220px; width: calc(100% - 220px); padding: 36px 28px; }
        }

        @media (max-width: 767px) {
          .al-sidebar { display: none; }
          .al-main { margin-left: 0; width: 100%; padding: 28px 16px 48px; }
          .al-mob-header {
            display: flex; height: 64px; position: sticky; top: 0; z-index: 100;
            background: #111111; padding: 0 16px; align-items: center; justify-content: space-between;
          }
          .al-mob-brand { font-size: 20px; font-weight: 800; color: #fff; text-decoration: none; letter-spacing: -0.05em; }
          .al-mob-menu { width: 36px; height: 36px; border: none; background: transparent; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        }

        @media (max-width: 320px) { .al-main { padding-left: 12px; padding-right: 12px; } }
        @media (prefers-reduced-motion: reduce) { .al-root * { animation: none !important; transition: none !important; } }
      `}</style>

      <aside className="al-sidebar">
        <div className="al-brand-wrap">
          <Link to="/admin/dashboard" className="al-brand">MIZFIT</Link>
          <p className="al-brand-sub">ADMIN PANEL</p>
        </div>
        <nav className="al-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`al-nav-link${isActive(item.path) ? ' active' : ''}`}>
              {item.label === 'Dashboard' ? (
                <svg className="al-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ) : (
                <svg className="al-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              )}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="al-user">
          <p className="al-user-label">ADMIN</p>
          <p className="al-user-email">{adminEmail}</p>
          <button onClick={handleLogout} className="al-signout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <header className="al-mob-header">
        <Link to="/admin/dashboard" className="al-mob-brand">MIZFIT</Link>
        <button className="al-mob-menu" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      <div className={`al-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div ref={drawerRef} className={`al-drawer${drawerOpen ? ' open' : ''}`}>
        <button className="al-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <nav className="al-drawer-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`al-nav-link${isActive(item.path) ? ' active' : ''}`}>
              {item.label === 'Dashboard' ? (
                <svg className="al-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ) : (
                <svg className="al-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              )}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="al-drawer-user">
          <p className="al-user-label">ADMIN</p>
          <p className="al-user-email">{adminEmail}</p>
          <button onClick={handleLogout} className="al-signout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      <main className="al-main">
        <div className="al-main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
