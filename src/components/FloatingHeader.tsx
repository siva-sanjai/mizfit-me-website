import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

const NAV_ITEMS = [
  { path: '/shop', label: 'SHOP' },
  { path: '/about', label: 'ABOUT' },
  { path: '/contact', label: 'CONTACT' },
];

export default function FloatingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  const { count } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isMobile = winWidth < 640;
  const isDesktop = winWidth >= 900;

  return (
    <>
      <style>{`
        .fh-nav-link {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.14em;
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
          text-decoration: none;
          padding: 8px 0;
          position: relative;
          transition: color 0.2s ease;
          color: rgba(0,0,0,0.5);
        }
        .fh-nav-link:hover { color: #000000; }
        .fh-nav-link:hover .fh-nav-underline { transform: scaleX(1); transform-origin: left; }
        .fh-nav-underline {
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 1px;
          background: #000000;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.25s ease;
        }
        .fh-nav-underline.active { transform: scaleX(1); transform-origin: left; }
        .fh-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: #111111;
          outline: none;
          padding: 0;
          transition: background 0.2s ease;
        }
        .fh-icon-btn:hover { background: rgba(0, 0, 0, 0.06); }
        .fh-menu-overlay { animation: fhMenuIn 0.25s ease-out; }
        @keyframes fhMenuIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fhMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .fh-marquee-track {
          display: flex;
          width: max-content;
          animation: fhMarquee 50s linear infinite;
        }
        .fh-marquee-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Announcement marquee */}
      <div style={{
        background: '#0a0a0a',
        color: 'rgba(255,255,255,0.7)',
        fontSize: isMobile ? 10 : 11,
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        height: isMobile ? 24 : 28,
        display: 'flex',
        alignItems: 'center',
      }}>
        <div className="fh-marquee-track">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} style={{ padding: '0 32px', flexShrink: 0 }}>
              WE ARE LAUNCHING SOON &nbsp;&nbsp;&#x2022;&nbsp;&nbsp; STAY TUNED &nbsp;&nbsp;&#x2022;&nbsp;&nbsp; PREMIUM CUSTOM TEES &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <header style={{
        position: 'relative',
        zIndex: 100,
        width: '100%',
        background: '#f6f6f3',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div className="mizfit-container" style={{
          display: 'grid',
          gridTemplateColumns: isDesktop
            ? 'minmax(140px, auto) 1fr minmax(140px, auto)'
            : '1fr auto',
          alignItems: 'center',
          height: isMobile ? 56 : 64,
        }}>
          <div style={{ justifySelf: 'start' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
              <span style={{
                fontSize: isMobile ? 20 : 24,
                fontWeight: 800,
                letterSpacing: '-0.05em',
                lineHeight: 1,
                color: '#0a0a0a',
                whiteSpace: 'nowrap',
              }}>MIZFIT</span>
            </Link>
          </div>
          {isDesktop && (
            <nav style={{ justifySelf: 'center', display: 'flex', alignItems: 'center', gap: 40 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link key={item.path} to={item.path} className="fh-nav-link" style={{ color: isActive ? '#000000' : undefined }}>
                    {item.label}
                    <span className={`fh-nav-underline${isActive ? ' active' : ''}`} />
                  </Link>
                );
              })}
            </nav>
          )}
          <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8 }}>
            <Link to="/cart" className="fh-icon-btn" style={{ width: isMobile ? 36 : 40, height: isMobile ? 36 : 40, textDecoration: 'none', position: 'relative' }}>
              <svg width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 2, minWidth: 16, height: 16, borderRadius: 999, background: '#111111', color: '#ffffff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: '0 4px' }}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
            {!isDesktop && (
              <button onClick={() => setIsMenuOpen((v) => !v)} className="fh-icon-btn" style={{ width: isMobile ? 36 : 40, height: isMobile ? 36 : 40 }}>
                {isMenuOpen ? (
                  <svg width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && !isDesktop && (
        <div className="fh-menu-overlay" style={{ position: 'fixed', top: isMobile ? 64 : 72, left: isMobile ? 10 : 24, right: isMobile ? 10 : 24, background: '#f8f8f6', borderRadius: 14, padding: 24, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', zIndex: 99 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path} style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: isActive ? '#000000' : 'rgba(0,0,0,0.6)', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
