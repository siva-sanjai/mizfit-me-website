import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const stats = [
  { value: '5000+', label: 'ORDERS DELIVERED', numeric: 5000 },
  { value: '1000+', label: 'HAPPY CUSTOMERS', numeric: 1000 },
  { value: '50+', label: 'DESIGNS DAILY', numeric: 50 },
  { value: 'Pan India', label: 'DELIVERY', numeric: 0 },
]

const values = [
  {
    title: 'Quality',
    description:
      'Every T-shirt we produce uses 100% combed ring-spun cotton with double-stitched seams. Our prints are tested for durability, wash after wash.',
  },
  {
    title: 'Creativity',
    description:
      'We believe your wardrobe should be as unique as you are. Our easy-to-use design tool puts professional-level customization in your hands.',
  },
  {
    title: 'Community',
    description:
      'From local artists to college fests and corporate teams, we help communities express themselves through custom apparel they can wear with pride.',
  },
]

function useOnScreen(ref: React.RefObject<HTMLDivElement | null>, threshold = 0.15) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

function AnimatedStat({ target, label, visible, reduced }: { target: number; label: string; visible: boolean; reduced: boolean }) {
  const [count, setCount] = useState(0)
  const displayText = target === 0 ? 'Pan India' : `${count}+`

  useEffect(() => {
    if (!visible || target === 0) return
    const duration = 1400
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, target])

  return (
    <div className="ap-stat">
      {!reduced && (
        <style>{`
          .ap-stat { --count: ${target === 0 ? 1 : count}; }
        `}</style>
      )}
      <p className="ap-stat-number">{displayText}</p>
      <p className="ap-stat-label">{label}</p>
    </div>
  )
}

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  const reduced = useReducedMotion()

  const storyRef = useRef<HTMLDivElement>(null)
  const storyVisible = useOnScreen(storyRef, 0.1)

  const statsRef = useRef<HTMLDivElement>(null)
  const statsVisible = useOnScreen(statsRef, 0.2)

  const valuesRef = useRef<HTMLDivElement>(null)
  const valuesVisible = useOnScreen(valuesRef, 0.1)

  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaVisible = useOnScreen(ctaRef, 0.1)

  useEffect(() => {
    setMounted(true)
  }, [])

  const anim = (delay: number) =>
    mounted && !reduced
      ? {
          opacity: 1,
          transform: 'translateY(0)',
          transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        }
      : {
          opacity: mounted || reduced ? 1 : 0,
          transform: mounted || reduced ? 'translateY(0)' : 'translateY(30px)',
        }

  const statAnim = (i: number) =>
    statsVisible || reduced
      ? {
          opacity: 1,
          transform: 'translateY(0)',
          transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms`,
        }
      : { opacity: reduced ? 1 : 0, transform: reduced ? 'translateY(0)' : 'translateY(20px)' }

  const valueAnim = (i: number) =>
    valuesVisible || reduced
      ? {
          opacity: 1,
          transform: 'translateY(0)',
          transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms`,
        }
      : { opacity: reduced ? 1 : 0, transform: reduced ? 'translateY(0)' : 'translateY(24px)' }

  return (
    <div className="ap-page">
      <style>{`
        .ap-page {
          width: 100%;
          background: #f6f6f3;
          color: #111111;
          padding-top: 150px;
          padding-bottom: 0;
          min-height: 100vh;
          overflow: visible;
        }
        .ap-page * { min-width: 0; box-sizing: border-box; }

        /* ─── HERO ─── */
        .ap-hero {
          padding-bottom: clamp(90px, 10vw, 160px);
        }
        .ap-hero-label {
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.42);
        }
        .ap-hero-heading {
          margin-top: 24px;
          font-size: clamp(42px, 6vw, 96px);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.06em;
          color: #0a0a0a;
          text-transform: uppercase;
        }

        /* ─── STORY ─── */
        .ap-story-grid {
          display: grid;
          grid-template-columns: minmax(220px, 0.6fr) minmax(0, 1.4fr);
          gap: clamp(70px, 10vw, 170px);
          margin-top: clamp(48px, 5vw, 72px);
          padding-bottom: clamp(72px, 7vw, 110px);
          align-items: start;
        }
        .ap-story-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.42);
        }
        .ap-story-year {
          margin-top: 12px;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: rgba(0,0,0,0.32);
        }
        .ap-story-text {
          max-width: 650px;
          font-size: clamp(17px, 1.5vw, 22px);
          font-weight: 450;
          line-height: 1.5;
          letter-spacing: -0.015em;
          color: #111111;
          margin: 0;
        }
        .ap-story-text .ap-highlight {
          font-weight: 650;
        }

        /* ─── STATS ─── */
        .ap-stats {
          border-top: 1px solid rgba(0,0,0,0.16);
          border-bottom: 1px solid rgba(0,0,0,0.16);
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin-bottom: clamp(100px, 10vw, 160px);
        }
        .ap-stat-wrap {
          min-height: 220px;
          padding: 40px clamp(20px, 3vw, 48px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          border-right: 1px solid rgba(0,0,0,0.16);
        }
        .ap-stat-wrap:last-child {
          border-right: none;
        }
        .ap-stat-number {
          font-size: clamp(52px, 5vw, 86px);
          font-weight: 750;
          line-height: 0.9;
          letter-spacing: -0.06em;
          color: #111111;
          text-transform: uppercase;
        }
        .ap-stat-number-pan {
          font-size: clamp(36px, 4vw, 64px);
        }
        .ap-stat-label {
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.42);
        }

        /* ─── VALUES ─── */
        .ap-values-section {
          padding-bottom: clamp(110px, 12vw, 180px);
        }
        .ap-values-header {
          display: grid;
          grid-template-columns: minmax(180px, 0.5fr) minmax(0, 1.5fr);
          gap: clamp(60px, 8vw, 140px);
          align-items: end;
          margin-bottom: clamp(60px, 7vw, 100px);
        }
        .ap-values-sub {
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.42);
        }
        .ap-values-title {
          font-size: clamp(40px, 5vw, 80px);
          font-weight: 800;
          line-height: 0.85;
          letter-spacing: -0.055em;
          text-transform: uppercase;
          color: #111111;
        }
        .ap-values-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-top: 1px solid rgba(0,0,0,0.16);
          border-bottom: 1px solid rgba(0,0,0,0.16);
        }
        .ap-value-item {
          min-height: 420px;
          padding: 38px clamp(24px, 3vw, 48px);
          display: flex;
          flex-direction: column;
          position: relative;
          border-right: 1px solid rgba(0,0,0,0.16);
          transition: background 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        .ap-value-item:last-child {
          border-right: none;
        }
        .ap-value-number {
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.14em;
          color: rgba(0,0,0,0.35);
          transition: color 0.3s ease;
        }
        .ap-value-title {
          margin-top: auto;
          font-size: clamp(34px, 3.4vw, 58px);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: -0.045em;
          color: #111111;
          transition: color 0.3s ease;
        }
        .ap-value-desc {
          margin-top: 24px;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(0,0,0,0.5);
          max-width: 360px;
          transition: color 0.3s ease;
        }

        @media (hover: hover) and (pointer: fine) {
          .ap-value-item:hover {
            background: #111111;
          }
          .ap-value-item:hover .ap-value-number {
            color: rgba(255,255,255,0.4);
          }
          .ap-value-item:hover .ap-value-title {
            color: #ffffff;
          }
          .ap-value-item:hover .ap-value-desc {
            color: rgba(255,255,255,0.62);
          }
        }

        /* ─── CTA ─── */
        .ap-cta {
          background: #0a0a0a;
          color: #ffffff;
          border-radius: 14px;
          min-height: 500px;
          padding: clamp(48px, 7vw, 100px);
          margin-bottom: clamp(100px, 10vw, 150px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .ap-cta-bg {
          position: absolute;
          right: -2%;
          bottom: -14%;
          font-size: clamp(180px, 27vw, 500px);
          font-weight: 800;
          line-height: 0.7;
          letter-spacing: -0.08em;
          color: rgba(255,255,255,0.025);
          pointer-events: none;
          user-select: none;
        }
        .ap-cta-label {
          position: relative;
          z-index: 1;
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.42);
        }
        .ap-cta-content {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
          position: relative;
          z-index: 1;
        }
        .ap-cta-heading {
          font-size: clamp(58px, 7vw, 110px);
          font-weight: 750;
          line-height: 0.82;
          letter-spacing: -0.065em;
          text-transform: uppercase;
          color: #ffffff;
        }
        .ap-cta-desc {
          margin-top: 28px;
          max-width: 500px;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.52);
        }
        .ap-cta-btn {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: #ffffff;
          color: #111111;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          flex-shrink: 0;
          text-decoration: none;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .ap-cta-btn:hover {
          transform: rotate(-4deg) scale(1.04);
        }
        .ap-cta-btn-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #111111;
          line-height: 1.2;
          text-align: center;
        }
        .ap-cta-btn-icon {
          width: 16px;
          height: 16px;
          color: #111111;
        }

        /* ─── TABLET 768–1024px ─── */
        @media (max-width: 1024px) {
          .ap-page { padding-top: 125px; }
          .ap-hero-heading {
            font-size: clamp(38px, 8vw, 72px);
          }
          .ap-story-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .ap-story-text {
            max-width: 680px;
            font-size: 18px;
            line-height: 1.5;
          }
          .ap-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .ap-stat-wrap {
            min-height: 190px;
          }
          .ap-stat-wrap:nth-child(2) {
            border-right: none;
          }
          .ap-stat-wrap:nth-child(1),
          .ap-stat-wrap:nth-child(2) {
            border-bottom: 1px solid rgba(0,0,0,0.16);
          }
          .ap-values-header {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .ap-values-grid {
            grid-template-columns: 1fr;
          }
          .ap-value-item {
            min-height: 320px;
            border-right: none;
            border-bottom: 1px solid rgba(0,0,0,0.16);
          }
          .ap-value-item:last-child {
            border-bottom: none;
          }
          .ap-cta-content {
            align-items: flex-end;
          }
        }

        /* ─── MOBILE <768px ─── */
        @media (max-width: 767px) {
          .ap-page { padding-top: 100px; }
          .ap-hero-label {
            font-size: 8px;
          }
          .ap-hero-heading {
            font-size: clamp(28px, 10vw, 48px);
            line-height: 1;
            letter-spacing: -0.05em;
            margin-top: 20px;
          }
          .ap-story-grid {
            margin-top: 64px;
            display: block;
          }
          .ap-story-label {
            margin-bottom: 30px;
          }
          .ap-story-text {
            font-size: 16px;
            line-height: 1.55;
            max-width: 100%;
          }
          .ap-values-header {
            margin-bottom: 48px;
          }
          .ap-values-title {
            font-size: clamp(34px, 12vw, 56px);
          }
          .ap-value-item {
            min-height: 300px;
            padding: 28px 20px;
          }
          .ap-value-title {
            font-size: clamp(38px, 12vw, 54px);
          }
          .ap-value-desc {
            font-size: 12px;
          }
          .ap-cta {
            min-height: 560px;
            padding: 32px 24px;
            border-radius: 10px;
          }
          .ap-cta-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 48px;
          }
          .ap-cta-heading {
            font-size: clamp(48px, 15vw, 72px);
          }
          .ap-cta-desc {
            font-size: 12px;
          }
          .ap-cta-btn {
            width: 112px;
            height: 112px;
            align-self: flex-end;
          }
        }

        @media (max-width: 600px) {
          .ap-stat-wrap {
            min-height: 150px;
            padding: 24px 16px;
          }
          .ap-stat-wrap:nth-child(1),
          .ap-stat-wrap:nth-child(3) {
            border-right: 1px solid rgba(0,0,0,0.16);
          }
          .ap-stat-wrap:nth-child(2),
          .ap-stat-wrap:nth-child(4) {
            border-right: none;
          }
          .ap-stat-number {
            font-size: clamp(38px, 12vw, 56px);
          }
          .ap-stat-number-pan {
            font-size: clamp(27px, 8vw, 40px);
          }
          .ap-stat-label {
            font-size: 7px;
          }
        }

        @media (max-width: 320px) {
          .ap-page { padding-top: 100px; }
          .mizfit-container {
            padding-left: 12px;
            padding-right: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ap-page * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* ─── HERO ─── */}
      <div className="mizfit-container">
        <section className="ap-hero">
          <p className="ap-hero-label" style={anim(0)}>
            ABOUT MIZFIT
          </p>
          <h1 className="ap-hero-heading" style={anim(120)}>
            WE PRINT WHAT YOU IMAGINE.
          </h1>

          {/* ─── STORY ─── */}
          <div ref={storyRef} className="ap-story-grid" style={storyVisible || reduced ? anim(220) : { opacity: reduced ? 1 : 0, transform: reduced ? 'translateY(0)' : 'translateY(24px)' }}>
            <div>
              <p className="ap-story-label">OUR STORY</p>
              <p className="ap-story-year">2020 &mdash; NOW</p>
            </div>
            <div className="ap-story-text">
              <p>
                MIZFIT started with one simple idea &mdash; <span className="ap-highlight">turn creativity into something you can wear</span>. We create premium custom T-shirts for people, teams and brands who want to wear their ideas their way. From personal designs to bold identities, <span className="ap-highlight">you imagine it, we print it.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section ref={statsRef} className="ap-stats">
          {stats.map((stat, i) => (
            <div key={stat.label} className="ap-stat-wrap" style={statAnim(i)}>
              {stat.value === 'Pan India' ? (
                <p className={`ap-stat-number ap-stat-number-pan`}>{stat.value}</p>
              ) : (
                <AnimatedStat target={stat.numeric} label={stat.label} visible={statsVisible} reduced={reduced} />
              )}
              <p className="ap-stat-label">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* ─── VALUES ─── */}
        <section className="ap-values-section">
          <div className="ap-values-header">
            <p className="ap-values-sub">WHAT WE STAND FOR</p>
            <h2 className="ap-values-title">OUR VALUES.</h2>
          </div>
          <div ref={valuesRef} className="ap-values-grid">
            {values.map((val, i) => (
              <div key={val.title} className="ap-value-item" style={valueAnim(i)}>
                <p className="ap-value-number">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="ap-value-title">{val.title}</h3>
                <p className="ap-value-desc">{val.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section ref={ctaRef} className="ap-cta" style={ctaVisible || reduced ? { opacity: 1, transform: 'scale(1)', transition: 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)' } : { opacity: reduced ? 1 : 0, transform: reduced ? 'scale(1)' : 'scale(0.985)' }}>
          <p className="ap-cta-bg">MIZFIT</p>
          <p className="ap-cta-label">CUSTOM PRINTING / MIZFIT</p>
          <div className="ap-cta-content">
            <div>
              <h2 className="ap-cta-heading">
                READY TO<br />
                CREATE YOURS?
              </h2>
              <p className="ap-cta-desc">
                No minimums, no hassle. Upload your design and get premium-quality custom T-shirts delivered to your door.
              </p>
            </div>
            <Link to="/customize" className="ap-cta-btn">
              <span className="ap-cta-btn-label">
                START<br />
                DESIGNING
              </span>
              <svg className="ap-cta-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
