import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

const NAV_ITEMS = [
  { path: '/shop', label: 'SHOP' },
  { path: '/customize', label: 'CUSTOMIZE' },
  { path: '/about', label: 'ABOUT' },
  { path: '/contact', label: 'CONTACT' },
];

export default function FloatingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  const { count } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isMobile = winWidth < 640;
  const isDesktop = winWidth >= 900;

  const h = isMobile ? 58 : isScrolled ? 60 : 68;

  return (
    <>
      <style>{`
        .fh-nav-link {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
          text-decoration: none;
          padding: 10px 0;
          position: relative;
          transition: color 0.2s ease;
          color: rgba(0,0,0,0.55);
        }
        .fh-nav-link:hover {
          color: #000000;
        }
        .fh-nav-link:hover .fh-nav-underline {
          transform: scaleX(1);
          transform-origin: left;
        }
        .fh-nav-underline {
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 100%;
          height: 1px;
          background: #000000;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.25s ease;
        }
        .fh-nav-underline.active {
          transform: scaleX(1);
          transform-origin: left;
        }
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
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .fh-icon-btn:hover {
          background: rgba(0, 0, 0, 0.06);
        }
        .fh-menu-overlay {
          animation: fhMenuIn 0.25s ease-out;
        }
        @keyframes fhMenuIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header
        style={{
          position: 'fixed',
          zIndex: 1000,
          pointerEvents: 'none',
          top: isMobile ? 10 : 18,
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? 'calc(100% - 20px)' : 'calc(100% - 48px)',
          maxWidth: 1180,
          height: h,
          boxSizing: 'border-box',
          transition: 'height 0.3s ease',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            background: isScrolled ? 'rgba(235,235,232,0.85)' : 'rgba(235,235,232,0.78)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: isMobile ? 14 : 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            padding: isMobile ? '0 14px' : '0 24px',
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop
                ? 'minmax(180px, 1fr) auto minmax(180px, 1fr)'
                : '1fr auto',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Left - Logo */}
            <div style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center' }}>
              <Link
                to="/"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: 0,
                  margin: 0,
                  appearance: 'none',
                  textDecoration: 'none',
                }}
              >
                <span
                  style={{
                    fontSize: isMobile ? 21 : 24,
                    fontWeight: 800,
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                    color: '#0a0a0a',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  MIZFIT
                </span>
              </Link>
            </div>

            {/* Center - Desktop Nav */}
            {isDesktop && (
              <nav style={{ justifySelf: 'center', display: 'flex', alignItems: 'center', gap: 36 }}>
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="fh-nav-link"
                      style={{
                        color: isActive ? '#000000' : undefined,
                      }}
                    >
                      {item.label}
                      <span
                        className={`fh-nav-underline${isActive ? ' active' : ''}`}
                      />
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right - Icons */}
            <div
              style={{
                justifySelf: 'end',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 2 : 8,
              }}
            >
              <Link
                to="/cart"
                className="fh-icon-btn"
                style={{
                  width: isMobile ? 36 : 40,
                  height: isMobile ? 36 : 40,
                  textDecoration: 'none',
                  position: 'relative',
                }}
              >
                <svg
                  width={isMobile ? 18 : 20}
                  height={isMobile ? 18 : 20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {count > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 3,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 999,
                      background: '#111111',
                      color: '#ffffff',
                      fontSize: 9,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      padding: '0 4px',
                    }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>

              {!isDesktop && (
                <button
                  onClick={() => setIsMenuOpen((v) => !v)}
                  className="fh-icon-btn"
                  style={{
                    width: isMobile ? 36 : 40,
                    height: isMobile ? 36 : 40,
                  }}
                >
                  {isMenuOpen ? (
                    <svg
                      width={isMobile ? 18 : 20}
                      height={isMobile ? 18 : 20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <svg
                      width={isMobile ? 18 : 20}
                      height={isMobile ? 18 : 20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Menu */}
      {isMenuOpen && !isDesktop && (
        <div
          className="fh-menu-overlay"
          style={{
            position: 'fixed',
            top: isMobile ? 78 : 96,
            left: isMobile ? 10 : 24,
            right: isMobile ? 10 : 24,
            background: '#f8f8f6',
            borderRadius: 14,
            padding: 24,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
            zIndex: 999,
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NAV_ITEMS.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    color: isActive ? '#000000' : 'rgba(0,0,0,0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                >
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
