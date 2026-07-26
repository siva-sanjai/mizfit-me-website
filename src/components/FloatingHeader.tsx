import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const [floatingVisible, setFloatingVisible] = useState(false);
  const { count } = useCart();
  const location = useLocation();
  const lastScroll = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 80);
        lastScroll.current = y;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (scrolled) {
      setFloatingVisible(true);
    } else {
      const t = setTimeout(() => setFloatingVisible(false), 350);
      return () => clearTimeout(t);
    }
  }, [scrolled]);

  const isMobile = winWidth < 640;
  const isDesktop = winWidth >= 900;

  const renderNavLinks = () => (
    NAV_ITEMS.map((item) => {
      const isActive =
        location.pathname === item.path ||
        (item.path !== '/' && location.pathname.startsWith(item.path));
      return (
        <Link
          key={item.path}
          to={item.path}
          className="fh-nav-link"
          style={{ color: isActive ? '#000000' : undefined }}
        >
          {item.label}
          <span className={`fh-nav-underline${isActive ? ' active' : ''}`} />
        </Link>
      );
    })
  );

  const renderCart = (size: number) => (
    <Link
      to="/cart"
      className="fh-icon-btn"
      style={{
        width: size,
        height: size,
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
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
        <span style={{
          position: 'absolute',
          top: 4,
          right: 2,
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
        }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );

  const renderHamburger = (size: number) => (
    !isDesktop && (
      <button
        onClick={() => setIsMenuOpen((v) => !v)}
        className="fh-icon-btn"
        style={{ width: size, height: size }}
      >
        {isMenuOpen ? (
          <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>
    )
  );

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

        .fh-static {
          position: relative;
          z-index: 100;
          width: 100%;
          background: transparent;
        }
        .fh-static .fh-inner {
          display: grid;
          grid-template-columns: ${isDesktop ? 'minmax(140px, auto) 1fr minmax(140px, auto)' : '1fr auto'};
          align-items: center;
          height: ${isMobile ? 56 : 64};
        }
        .fh-static .fh-logo { color: #ffffff; }
        .fh-static .fh-nav-link { color: rgba(255,255,255,0.6); }
        .fh-static .fh-nav-link:hover { color: #ffffff; }
        .fh-static .fh-nav-underline { background: #ffffff; }
        .fh-static .fh-icon-btn { color: #ffffff; }
        .fh-static .fh-icon-btn:hover { background: rgba(255,255,255,0.12); }
        .fh-static .fh-cart-badge { background: #ffffff; color: #000000; }

        .fh-floating {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(${scrolled ? '0' : '-20px'});
          opacity: ${scrolled ? 1 : 0};
          transition: transform 350ms ease-out, opacity 350ms ease-out;
          pointer-events: ${scrolled ? 'auto' : 'none'};
          z-index: 9999;
          width: 92%;
          max-width: 1450px;
        }
        @media (max-width: 1024px) { .fh-floating { width: 95%; } }
        @media (max-width: 640px) { .fh-floating { width: 96%; top: 12px; } }
        .fh-floating .fh-pill {
          height: ${isMobile ? 64 : 72}px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 18px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.10);
          display: grid;
          grid-template-columns: ${isDesktop ? 'minmax(140px, auto) 1fr minmax(140px, auto)' : '1fr auto'};
          align-items: center;
          padding: 0 ${isMobile ? 16 : 24}px;
        }
        .fh-floating .fh-logo { color: #0a0a0a; }
        .fh-floating .fh-nav-link { color: rgba(0,0,0,0.5); }
        .fh-floating .fh-nav-link:hover { color: #000000; }
        .fh-floating .fh-nav-underline { background: #000000; }
        .fh-floating .fh-icon-btn { color: #111111; }
        .fh-floating .fh-icon-btn:hover { background: rgba(0,0,0,0.06); }
        .fh-floating .fh-cart-badge { background: #111111; color: #ffffff; }
      `}</style>

      {/* Static header (over hero, at top) */}
      <header className="fh-static" style={{ opacity: scrolled ? 0 : 1, transition: 'opacity 300ms ease', pointerEvents: scrolled ? 'none' : 'auto' }}>
        <div className="mizfit-container fh-inner">
          <div style={{ justifySelf: 'start' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="fh-logo" style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, whiteSpace: 'nowrap' }}>MIZFIT</span>
            </Link>
          </div>
          {isDesktop && <nav style={{ justifySelf: 'center', display: 'flex', alignItems: 'center', gap: 40 }}>{renderNavLinks()}</nav>}
          <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8 }}>
            {renderCart(isMobile ? 36 : 40)}
            {renderHamburger(isMobile ? 36 : 40)}
          </div>
        </div>
      </header>

      {/* Floating sticky header */}
      <div className="fh-floating">
        <div className="fh-pill">
          <div style={{ justifySelf: 'start' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="fh-logo" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, whiteSpace: 'nowrap' }}>MIZFIT</span>
            </Link>
          </div>
          {isDesktop && <nav style={{ justifySelf: 'center', display: 'flex', alignItems: 'center', gap: 40 }}>{renderNavLinks()}</nav>}
          <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8 }}>
            {renderCart(isMobile ? 36 : 40)}
            {renderHamburger(isMobile ? 36 : 40)}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && !isDesktop && (
        <div
          className="fh-menu-overlay"
          style={{
            position: 'fixed',
            top: floatingVisible ? 88 : (isMobile ? 64 : 72),
            left: isMobile ? 10 : 24,
            right: isMobile ? 10 : 24,
            background: '#f8f8f6',
            borderRadius: 14,
            padding: 24,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
            zIndex: 9998,
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
