import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function MinimalFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!footerRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(footerRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <footer ref={footerRef} className="mf-footer">
      <style>{`
        .mf-footer {
          background: #0a0a0a;
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .mf-main {
          padding: 64px 0 56px;
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(140px, 0.5fr) minmax(140px, 0.5fr);
          gap: clamp(60px, 8vw, 140px);
          align-items: start;
          position: relative;
          z-index: 1;
        }

        .mf-brand-logo {
          font-size: clamp(40px, 5vw, 76px);
          font-weight: 800;
          letter-spacing: -0.065em;
          line-height: 0.9;
          color: #ffffff;
          text-decoration: none;
          display: block;
        }
        .mf-brand-tagline {
          margin-top: 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          line-height: 1.5;
          color: rgba(255,255,255,0.72);
        }
        .mf-brand-desc {
          margin-top: 14px;
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255,255,255,0.4);
          max-width: 320px;
        }

        .mf-col-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 14px;
        }
        .mf-col-link {
          display: block;
          width: fit-content;
          font-size: 15px;
          font-weight: 450;
          line-height: 1.8;
          color: rgba(255,255,255,0.68);
          text-decoration: none;
          transition: color 0.25s ease, transform 0.25s ease;
        }
        .mf-col-link:hover {
          color: #ffffff;
          transform: translateX(4px);
        }

        .mf-bottom {
          padding: 20px 0 24px;
          border-top: 1px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          position: relative;
          z-index: 1;
        }
        .mf-bottom-copy {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
        }
        .mf-bottom-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .mf-bottom-links a {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.25s ease;
        }
        .mf-bottom-links a:hover {
          color: #ffffff;
        }

        .mf-bg-text {
          position: absolute;
          right: -2vw;
          bottom: -0.18em;
          font-size: clamp(160px, 23vw, 420px);
          font-weight: 900;
          letter-spacing: -0.08em;
          line-height: 0.7;
          color: rgba(255,255,255,0.018);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          z-index: 0;
        }

        .mf-anim-out {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .mf-anim-in {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 767px) {
          .mf-main {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 48px 24px;
            padding: 52px 0 44px;
          }
          .mf-brand {
            grid-column: 1 / -1;
          }
          .mf-brand-logo {
            font-size: clamp(52px, 18vw, 76px);
          }
          .mf-col-link {
            font-size: 14px;
          }

          .mf-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .mf-bottom-links {
            gap: 20px;
          }
        }

        @media (max-width: 339px) {
          .mf-main {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .mf-brand {
            grid-column: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mf-anim-out {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div className="mizfit-container">
        {/* MAIN FOOTER */}
        <div className="mf-main">
          {/* BRAND */}
          <div className="mf-brand" style={{ transitionDelay: '100ms' }}>
            <Link to="/" className={`mf-brand-logo ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}>
              MIZFIT
            </Link>
            <p className={`mf-brand-tagline ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}>
              CUSTOM PRINTS.<br />YOUR RULES.
            </p>
            <p className={`mf-brand-desc ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}>
              Premium T-shirts, printed your way.
            </p>
          </div>

          {/* EXPLORE */}
          <div style={{ transitionDelay: '180ms' }}>
            <p className={`mf-col-label ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}>EXPLORE</p>
            <Link to="/shop" className={`mf-col-link ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}>Shop</Link>
            <Link to="/customize" className={`mf-col-link ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}>Customize</Link>
            <Link to="/about" className={`mf-col-link ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}>About</Link>
          </div>

          {/* CONNECT */}
          <div style={{ transitionDelay: '260ms' }}>
            <p className={`mf-col-label ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}>CONNECT</p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`mf-col-link ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}
            >
              Instagram
            </a>
            <Link to="/contact" className={`mf-col-link ${visible ? 'mf-anim-in' : 'mf-anim-out'}`}>Contact</Link>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className={`mf-bottom ${visible ? 'mf-anim-in' : 'mf-anim-out'}`} style={{ transitionDelay: '320ms' }}>
          <p className="mf-bottom-copy">&copy; 2026 MIZFIT. ALL RIGHTS RESERVED.</p>
          <div className="mf-bottom-links">
            <a href="#">PRIVACY</a>
            <a href="#">TERMS</a>
          </div>
        </div>
      </div>

      {/* OVERSIZED BACKGROUND TYPOGRAPHY */}
      <span className="mf-bg-text" aria-hidden="true">MIZFIT</span>
    </footer>
  )
}
