import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { getFeaturedProducts } from '@/services/products'
import ProductCard from '@/components/ProductCard'

const steps = [
  { num: '01', title: 'CHOOSE YOUR TEE', desc: 'Pick your fit, size & color.' },
  { num: '02', title: 'UPLOAD YOUR DESIGN', desc: 'Add your artwork or logo.' },
  { num: '03', title: 'PLACE YOUR ORDER', desc: 'Review and checkout securely.' },
  { num: '04', title: 'WE PRINT IT', desc: 'Precision printed with care.' },
  { num: '05', title: 'AT YOUR DOOR', desc: 'Delivered straight to you.' },
]

const values = [
  {
    num: '01',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5h12l2 4H4l2-4z" />
        <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
        <path d="M10 13h4" />
      </svg>
    ),
    title: 'Premium Quality',
    desc: '280 GSM heavyweight cotton with double-stitched seams.',
  },
  {
    num: '02',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'Custom Design',
    desc: 'Upload your artwork and preview your idea before ordering.',
  },
  {
    num: '03',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Pan India Delivery',
    desc: 'Secure delivery across India, straight to your doorstep.',
  },
]

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-mz-gray-200 border-t-mz-dark rounded-full animate-spin" />
    </div>
  )
}

function DotPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  )
}

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setAnimated(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const icons = [
    <svg key="s0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5h12l2 4H4l2-4z" /><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" /><path d="M10 13h4" />
    </svg>,
    <svg key="s1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>,
    <svg key="s2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="7" width="22" height="14" rx="2" /><polyline points="16 21 16 11 8 11 8 21" /><line x1="12" y1="11" x2="12" y2="7" /><path d="M18 4l-6-3-6 3" />
    </svg>,
    <svg key="s3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>,
    <svg key="s4" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>,
  ];

  return (
    <>
      <style>{`
        .hiw-section {
          padding: 80px 0 90px;
          background: #f7f7f4;
        }
        .hiw-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.55);
          text-align: center;
          margin-bottom: 16px;
        }
        .hiw-heading {
          font-size: clamp(38px, 4vw, 64px);
          font-weight: 750;
          letter-spacing: -0.045em;
          line-height: 1;
          text-align: center;
        }
        .hiw-tw {
          margin-top: 56px;
          position: relative;
        }
        .hiw-timeline {
          position: relative;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          align-items: start;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }
        .hiw-base-line {
          position: absolute;
          top: 21px;
          left: 10%;
          right: 10%;
          height: 1px;
          background: rgba(0,0,0,0.18);
          z-index: 0;
          pointer-events: none;
        }
        .hiw-progress-line {
          position: absolute;
          top: 21px;
          left: 10%;
          width: 80%;
          height: 2px;
          background: #111111;
          z-index: 1;
          pointer-events: none;
          transform: scaleX(0);
          transform-origin: left center;
        }
        .hiw-progress-line.go {
          animation: hiwLineGrow 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        @keyframes hiwLineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .hiw-step {
          text-align: center;
          position: relative;
          z-index: 3;
          padding: 0 12px;
        }
        .hiw-circle-wrap {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #f7f7f4;
          border: 1px solid rgba(0,0,0,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          position: relative;
          z-index: 3;
        }
        .hiw-circle-wrap.fill {
          animation: hiwCircleFill 0.5s ease forwards;
        }
        @keyframes hiwCircleFill {
          0% { background: #f7f7f4; color: #111; border-color: rgba(0,0,0,0.22); transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { background: #111; border-color: #111; color: #fff; transform: scale(1); }
        }
        .hiw-circle-num {
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
          color: inherit;
        }
        .hiw-circle-wrap.fill .hiw-circle-num {
          color: #ffffff;
        }
        .hiw-step-body {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .hiw-step-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          color: rgba(0,0,0,0.65);
        }
        .hiw-step-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          line-height: 1.4;
          text-transform: uppercase;
          color: #111111;
        }
        .hiw-step-desc {
          margin-top: 8px;
          font-size: 11px;
          line-height: 1.5;
          color: rgba(0,0,0,0.5);
          max-width: 160px;
        }
        .hiw-vline, .hiw-vprogress {
          display: none;
        }

        @media (max-width: 767px) {
          .hiw-section {
            padding: 64px 0 72px;
          }
          .hiw-heading {
            font-size: clamp(34px, 10vw, 46px);
          }
          .hiw-label, .hiw-heading {
            text-align: left;
          }
          .hiw-tw {
            margin-top: 48px;
          }
          .hiw-timeline {
            display: flex;
            flex-direction: column;
            gap: 32px;
            position: relative;
            max-width: 100%;
          }
          .hiw-base-line, .hiw-progress-line {
            display: none;
          }
          .hiw-vline {
            display: block;
            position: absolute;
            left: 21px;
            top: 21px;
            bottom: 21px;
            width: 1px;
            background: rgba(0,0,0,0.18);
            z-index: 0;
            pointer-events: none;
          }
          .hiw-vprogress {
            display: block;
            position: absolute;
            left: 21px;
            top: 21px;
            bottom: 21px;
            width: 2px;
            background: #111111;
            z-index: 1;
            pointer-events: none;
            transform: scaleY(0);
            transform-origin: top;
          }
          .hiw-vprogress.go {
            animation: hiwVLineGrow 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
          }
          @keyframes hiwVLineGrow {
            from { transform: scaleY(0); }
            to { transform: scaleY(1); }
          }
          .hiw-step {
            display: grid;
            grid-template-columns: 42px 1fr;
            align-items: start;
            text-align: left;
            padding: 0;
            gap: 16px;
          }
          .hiw-circle-wrap {
            margin: 0;
            width: 42px;
            height: 42px;
          }
          .hiw-step-body {
            margin-top: 0;
            align-items: flex-start;
            text-align: left;
          }
          .hiw-step-icon {
            margin-bottom: 6px;
          }
          .hiw-step-title {
            text-align: left;
          }
          .hiw-step-desc {
            text-align: left;
            margin: 4px 0 0 0;
            max-width: none;
          }
        }

        @media (min-width: 768px) {
          .hiw-vline, .hiw-vprogress { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hiw-progress-line, .hiw-vprogress { animation: none !important; transform: scaleX(1) !important; }
          .hiw-vprogress { transform: scaleY(1) !important; }
          .hiw-circle-wrap.fill { animation: none !important; background: #111 !important; border-color: #111 !important; color: #fff !important; }
        }
      `}</style>

      <section ref={sectionRef} className="hiw-section">
        <div className="mizfit-container">
          <p className="hiw-label">How It Works</p>
          <h2 className="hiw-heading">From design to doorstep</h2>

          <div className="hiw-tw">
            <div className="hiw-timeline">
              <div className="hiw-base-line" />
              <div className={`hiw-progress-line${animated ? ' go' : ''}`} />

              <div className="hiw-vline" />
              <div className={`hiw-vprogress${animated ? ' go' : ''}`} />

              {steps.map((step, idx) => (
                <div key={step.num} className="hiw-step">
                  <div>
                    <div
                      className={`hiw-circle-wrap${animated ? ' fill' : ''}`}
                      style={{ animationDelay: animated ? `${idx * 625}ms` : '0ms' }}
                    >
                      <span className="hiw-circle-num">{step.num}</span>
                    </div>
                  </div>
                  <div className="hiw-step-body">
                    <div className="hiw-step-icon">{icons[idx]}</div>
                    <div className="hiw-step-title">{step.title}</div>
                    <p className="hiw-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function WhyMizfitSection() {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setRevealed(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  return (
    <>
      <style>{`
        .wm-section {
          padding: 90px 0;
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }
        .wm-bg-text {
          position: absolute;
          right: 0;
          bottom: -0.08em;
          font-size: clamp(140px, 20vw, 360px);
          font-weight: 900;
          letter-spacing: -0.08em;
          color: rgba(255,255,255,0.018);
          pointer-events: none;
          user-select: none;
          line-height: 1;
        }
        .wm-grid {
          display: grid;
          grid-template-columns: 0.8fr 1.7fr;
          gap: clamp(60px, 8vw, 140px);
          align-items: start;
          position: relative;
          z-index: 1;
        }
        .wm-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .wm-heading {
          font-size: clamp(46px, 5vw, 78px);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.055em;
          color: #ffffff;
          margin-top: 20px;
        }
        .wm-desc {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.55);
          max-width: 340px;
          margin-top: 28px;
        }
        .wm-left {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .wm-left.reveal {
          opacity: 1;
          transform: translateY(0);
        }
        .wm-values {
          display: flex;
          flex-direction: column;
        }
        .wm-row {
          display: grid;
          grid-template-columns: 48px 52px 1fr;
          align-items: center;
          padding: 28px 0;
          min-height: 110px;
          border-top: 1px solid rgba(255,255,255,0.14);
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          cursor: default;
        }
        .wm-row.reveal {
          opacity: 1;
          transform: translateY(0);
        }
        .wm-row:last-child {
          border-bottom: 1px solid rgba(255,255,255,0.14);
        }
        .wm-row-num {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.35);
          align-self: start;
          padding-top: 5px;
        }
        .wm-row-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          align-self: start;
          padding-top: 2px;
          transition: transform 0.35s ease;
        }
        .wm-row-text {
          min-width: 0;
        }
        .wm-row-title {
          font-size: clamp(20px, 2vw, 30px);
          font-weight: 650;
          letter-spacing: -0.025em;
          line-height: 1.1;
          color: rgba(255,255,255,0.78);
          transition: color 0.35s ease;
        }
        .wm-row-desc {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255,255,255,0.48);
          margin-top: 8px;
          max-width: 500px;
        }
        @media (hover: hover) {
          .wm-row:hover {
            cursor: default;
          }
          .wm-row:hover .wm-row-content {
            transform: translateX(8px);
          }
          .wm-row:hover .wm-row-title {
            color: #ffffff;
          }
          .wm-row:hover .wm-row-icon {
            transform: translateX(4px);
          }
        }
        .wm-row-content {
          display: contents;
          transition: transform 0.35s ease, color 0.35s ease, opacity 0.35s ease;
        }

        @media (max-width: 767px) {
          .wm-section {
            padding: 64px 0 72px;
          }
          .wm-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .wm-heading {
            font-size: clamp(42px, 14vw, 62px);
          }
          .wm-desc {
            max-width: none;
          }
          .wm-row {
            grid-template-columns: 36px 40px 1fr;
            padding: 24px 0;
            min-height: auto;
          }
          .wm-row-title {
            font-size: 19px;
          }
          .wm-row-desc {
            font-size: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wm-left, .wm-row { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <section ref={ref} className="wm-section">
        <div className="wm-bg-text">MIZFIT</div>
        <div className="mizfit-container">
          <div className="wm-grid">
            <div className={`wm-left${revealed ? ' reveal' : ''}`}>
              <p className="wm-label">Why MIZFIT</p>
              <h2 className="wm-heading">
                BUILT FOR<br />YOUR IDEAS.
              </h2>
              <p className="wm-desc">
                Not another generic tee. Your design. Your fit. Your MIZFIT.
              </p>
            </div>

            <div className="wm-values">
              {values.map((v, idx) => (
                <div
                  key={v.num}
                  className={`wm-row${revealed ? ' reveal' : ''}`}
                  style={{ transitionDelay: revealed ? `${150 + idx * 150}ms` : '0ms' }}
                >
                  <span className="wm-row-num">{v.num}</span>
                  <span className="wm-row-icon">{v.icon}</span>
                  <div className="wm-row-content">
                    <div className="wm-row-text">
                      <div className="wm-row-title">{v.title}</div>
                      <p className="wm-row-desc">{v.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    getFeaturedProducts()
      .then((data) => setProducts(data))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <style>{`
        .hero-mizfit-bg {
          position: relative;
        }
        .hero-mizfit-sweep {
          animation: heroMizfitSweep 8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        @keyframes heroMizfitSweep {
          0% { background-position: 150% center; }
          45% { background-position: -150% center; }
          100% { background-position: -150% center; }
        }
        @media (max-width: 639px) {
          .hero-mizfit-sweep {
            animation-duration: 10s;
          }
          .hero-mizfit-base {
            color: rgba(255,255,255,0.025) !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-mizfit-sweep {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>
      {/* 1. Hero Banner */}
      <section className="mt-3 sm:mt-4">
        <div className="mizfit-container">
          <div
            className="relative overflow-hidden"
            style={{ width: '100%', height: 'clamp(400px, 48vh, 520px)', borderRadius: '18px', background: '#090909' }}
          >
            <DotPattern />
            <div className="absolute inset-0 bg-gradient-to-b from-mz-black/10 via-mz-black/30 to-mz-black/70" />
            {/* Large MIZFIT background typography */}
            <div
              className="hidden md:block pointer-events-none select-none hero-mizfit-bg"
              style={{ position: 'absolute', right: 'clamp(24px, 5vw, 80px)', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
            >
              <span
                className="hero-mizfit-base"
                style={{
                  fontSize: 'clamp(120px, 16vw, 280px)',
                  fontWeight: 900,
                  letterSpacing: '-0.08em',
                  lineHeight: 1,
                  color: 'rgba(255,255,255,0.035)',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                MIZFIT
              </span>
              <span
                className="hero-mizfit-sweep"
                aria-hidden="true"
                style={{
                  fontSize: 'clamp(120px, 16vw, 280px)',
                  fontWeight: 900,
                  letterSpacing: '-0.08em',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  display: 'block',
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'linear-gradient(110deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.025) 35%, rgba(255,255,255,0.13) 48%, rgba(255,255,255,0.20) 50%, rgba(255,255,255,0.13) 52%, rgba(255,255,255,0.025) 65%, rgba(255,255,255,0.025) 100%)',
                  backgroundSize: '250% 100%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.015)) drop-shadow(0 0 40px rgba(255,255,255,0.01))',
                }}
              >
                MIZFIT
              </span>
            </div>
            {/* Hero content */}
            <div
              style={{ position: 'absolute', left: 'clamp(32px, 5vw, 80px)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, maxWidth: '620px', right: 'clamp(32px, 5vw, 80px)' }}
            >
              <p
                className={`text-[11px] sm:text-xs font-medium uppercase tracking-[0.25em] text-mz-gray-400 mb-5 sm:mb-8 transition-all duration-700 ease-out ${
                  heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Premium Custom T-Shirt Printing
              </p>
              <h1
                className={`text-white font-extrabold leading-[0.9] transition-all duration-700 ease-out delay-150 ${
                  heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ fontSize: 'clamp(52px, 5vw, 76px)', letterSpacing: '-0.045em' }}
              >
                CUSTOM PRINTS.<br />
                YOUR RULES.
              </h1>
              <p
                className={`mt-4 sm:mt-5 text-base sm:text-lg text-mz-gray-400 max-w-lg leading-relaxed transition-all duration-700 ease-out delay-300 ${
                  heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                Upload it. We print it. You wear it.
              </p>
              <div
                className={`flex items-center gap-3 mt-7 transition-all duration-700 ease-out delay-[450ms] ${
                  heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <Link
                  to="/customize"
                  className="inline-flex items-center justify-center bg-white text-black font-bold uppercase no-underline transition-all duration-300 hover:bg-mz-gray-200"
                  style={{ height: '46px', padding: '0 24px', fontSize: '11px', letterSpacing: '0.1em', borderRadius: '6px', border: '1px solid #ffffff' }}
                >
                  Customize Your Tee
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center bg-transparent text-white font-bold uppercase no-underline transition-all duration-300 hover:bg-white hover:text-black"
                  style={{ height: '46px', padding: '0 24px', fontSize: '11px', letterSpacing: '0.1em', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.35)' }}
                >
                  Shop T-Shirts
                </Link>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </section>

      {/* 3. Trending Now */}
      <section className="bg-white" style={{ paddingTop: '64px', paddingBottom: '80px' }}>
        <div className="mizfit-container">
          <div style={{ marginBottom: '28px' }}>
            <h2
              className="font-bold text-mz-black tracking-tight leading-none"
              style={{ fontSize: 'clamp(32px, 3vw, 48px)', letterSpacing: '-0.035em' }}
            >
              Trending Now
            </h2>
            <p style={{ fontSize: '13px', marginTop: '8px', color: 'rgba(0,0,0,0.55)' }}>
              Made to wear. Ready to customize.
            </p>
          </div>

          {loading && <Spinner />}

          {error && (
            <div className="text-center py-16">
              <p className="text-mz-gray-500">{error}</p>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-mz-gray-500">No products available yet. Check back soon!</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[10px] md:gap-4 xl:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. How It Works */}
      <HowItWorksSection />

      {/* 5. Why MIZFIT */}
      <WhyMizfitSection />

      {/* 6. Bulk CTA */}
      <section className="py-20 md:py-24 bg-mz-black">
        <div className="mizfit-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Looking for bulk orders?
              </h2>
              <p className="mt-2 text-sm text-mz-gray-500">
                Exclusive pricing for teams, events &amp; businesses.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-mz-black font-semibold text-xs uppercase tracking-[0.2em] hover:bg-mz-gray-200 transition-all duration-300 shrink-0"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
