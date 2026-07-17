import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import type { Product } from '@/types'
import { getProducts } from '@/services/products'
import { formatPrice } from '@/utils/helpers'


type SortOption = 'newest' | 'price-low' | 'price-high'

const COLOR_MAP: Record<string, string> = {
  'Carbon Black': '#0d0d0d',
  'Optic White': '#f5f5f5',
  'Bone': '#e8dcc8',
  'Heather Grey': '#b0b0b0',
  'Olive Sage': '#7a8a6e',
  'Navy Blue': '#1e3a5f',
  'Burgundy': '#6e2c2c',
  'Washed Brown': '#8b7355',
  'Sand Beige': '#d4c5a9',
  'Forest Green': '#2d5a27',
}

const COLORS = Object.keys(COLOR_MAP)
const FIT_OPTIONS = ['Regular', 'Boxy', 'Oversized', 'Slim']
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [_error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const filterBtnRef = useRef<HTMLButtonElement>(null)

  const activeFit = searchParams.get('fit') || ''
  const activeColor = searchParams.get('color') || ''
  const activeSize = searchParams.get('size') || ''
  const activeSort = (searchParams.get('sort') as SortOption) || 'newest'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProducts()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Trap focus in drawer
  useEffect(() => {
    if (!filterDrawerOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFilterDrawerOpen(false)
        filterBtnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    // Focus first focusable element
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>('button, [tabindex]')
    firstFocusable?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filterDrawerOpen])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (activeFit) {
      result = result.filter(p => p.fit_type.toLowerCase() === activeFit.toLowerCase())
    }

    if (activeColor) {
      result = result.filter(p =>
        p.available_colors.some(c => c.toLowerCase() === activeColor.toLowerCase())
      )
    }

    if (activeSize) {
      result = result.filter(p =>
        p.available_sizes.some(s => s.toUpperCase() === activeSize.toUpperCase())
      )
    }

    switch (activeSort) {
      case 'price-low':
        result.sort((a, b) => a.base_price - b.base_price)
        break
      case 'price-high':
        result.sort((a, b) => b.base_price - a.base_price)
        break
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return result
  }, [products, activeFit, activeColor, activeSize, activeSort])

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams)
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const hasActiveFilters = activeFit || activeColor || activeSize


  const anim = (delay: number) =>
    mounted
      ? { opacity: 1, transform: 'translateY(0)', transition: `opacity 0.7s ease, transform 0.7s ease ${delay}ms` }
      : { opacity: 0, transform: 'translateY(24px)' }

  const animCard = (idx: number) => {
    const delay = Math.min(180 + idx * 40, 400)
    return mounted
      ? { opacity: 1, transform: 'translateY(0)', transition: `opacity 0.5s ease, transform 0.5s ease ${delay}ms` }
      : { opacity: 0, transform: 'translateY(16px)' }
  }

  const filterContent = (
    <>
      {/* COLOR */}
      <div className="sp-filter-section">
        <p className="sp-filter-title">COLOR</p>
        <div className="sp-filter-list">
          {COLORS.map(colorName => {
            const isActive = activeColor.toLowerCase() === colorName.toLowerCase()
            return (
              <button
                key={colorName}
                onClick={() => updateFilter('color', isActive ? '' : colorName.toLowerCase())}
                className="sp-color-opt"
                aria-pressed={isActive}
              >
                <span className="sp-color-left">
                  <span className="sp-color-dot" style={{ backgroundColor: COLOR_MAP[colorName] }} />
                  <span className={`sp-color-name${isActive ? ' sp-active' : ''}`}>{colorName}</span>
                </span>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* FIT */}
      <div className="sp-filter-section">
        <p className="sp-filter-title">FIT</p>
        <div className="sp-filter-list">
          {FIT_OPTIONS.map(fit => {
            const isActive = activeFit.toLowerCase() === fit.toLowerCase()
            return (
              <button
                key={fit}
                onClick={() => updateFilter('fit', isActive ? '' : fit.toLowerCase())}
                className="sp-fit-opt"
                aria-pressed={isActive}
              >
                <span className={`sp-fit-name${isActive ? ' sp-active' : ''}`}>{fit}</span>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* SIZE */}
      <div className="sp-filter-section">
        <p className="sp-filter-title">SIZE</p>
        <div className="sp-size-grid">
          {SIZE_OPTIONS.map(size => {
            const isActive = activeSize.toUpperCase() === size.toUpperCase()
            return (
              <button
                key={size}
                onClick={() => updateFilter('size', isActive ? '' : size.toUpperCase())}
                className={`sp-size-btn${isActive ? ' sp-selected' : ''}`}
                aria-pressed={isActive}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="sp-clear-btn">
          CLEAR ALL
        </button>
      )}
    </>
  )

  const renderProduct = (product: Product, index: number) => (
    <div key={product.id} className="sp-card" style={animCard(index)}>
      <Link to={`/product/${product.id}`} className="sp-card-link">
        <div className="sp-card-image">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} loading="lazy" />
          ) : (
            <div className="sp-card-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="sp-card-overlay">
            <span>VIEW PRODUCT</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l10-10M7 7h10v10" />
            </svg>
          </div>
        </div>
        <div className="sp-card-info">
          <p className="sp-card-name">{product.name}</p>
          <p className="sp-card-price">{formatPrice(product.base_price)}</p>
          {product.available_colors.length > 0 && (
            <div className="sp-card-swatches">
              {product.available_colors.slice(0, 5).map(cName => (
                <span key={cName} className="sp-card-swatch" style={{ backgroundColor: COLOR_MAP[cName] || '#ccc' }} />
              ))}
              {product.available_colors.length > 5 && (
                <span className="sp-card-swatch-more">+{product.available_colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )

  const renderSkeleton = () => {
    const count = 6
    return (
      <div className="sp-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="sp-card">
            <div className="sp-card-image">
              <div className="sp-skel-pulse sp-skel-img" />
            </div>
            <div className="sp-card-info" style={{ paddingTop: '14px' }}>
              <div className="sp-skel-pulse sp-skel-name" />
              <div className="sp-skel-pulse sp-skel-price" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="sp-page">
      <style>{`
        .sp-page {
          width: 100%;
          background: #f6f6f3;
          color: #111111;
          padding-top: 140px;
          padding-bottom: 100px;
          min-height: 100vh;
        }

        .sp-toolbar {
          padding: 18px 0;
          border-top: 1px solid rgba(0,0,0,0.16);
          border-bottom: 1px solid rgba(0,0,0,0.16);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 40px;
        }
        .sp-toolbar-left {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.45);
        }
        .sp-toolbar-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .sp-filter-btn {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: transparent;
          border: none;
          color: #111111;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s ease;
        }
        .sp-filter-btn:hover { opacity: 0.55; }

        .sp-sort-wrapper { position: relative; }
        .sp-sort-btn {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: transparent;
          border: none;
          color: #111111;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s ease;
        }
        .sp-sort-btn:hover { opacity: 0.55; }
        .sp-sort-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          min-width: 170px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 6px;
          z-index: 30;
          overflow: hidden;
        }
        .sp-sort-dropdown button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          background: transparent;
          border: none;
          cursor: pointer;
          color: rgba(0,0,0,0.6);
          transition: background 0.15s ease, color 0.15s ease;
        }
        .sp-sort-dropdown button:hover { background: rgba(0,0,0,0.04); }
        .sp-sort-dropdown button.sp-sort-active { color: #111111; font-weight: 700; }

        .sp-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: clamp(48px, 5vw, 84px);
          align-items: start;
        }

        .sp-sidebar {
          position: sticky;
          top: 120px;
          align-self: start;
        }
        .sp-sidebar-title {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(0,0,0,0.45);
          margin-bottom: 4px;
        }

        .sp-filter-section {
          padding: 28px 0;
          border-bottom: 1px solid rgba(0,0,0,0.14);
        }
        .sp-filter-section:first-child {
          border-top: 1px solid rgba(0,0,0,0.14);
        }
        .sp-filter-title {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.45);
          margin-bottom: 18px;
        }

        .sp-filter-list { display: flex; flex-direction: column; }

        .sp-color-opt {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 0;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .sp-color-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sp-color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.16);
          flex-shrink: 0;
        }
        .sp-color-name {
          font-size: 12px;
          font-weight: 450;
          color: rgba(0,0,0,0.62);
        }
        .sp-color-name.sp-active {
          color: #111111;
          font-weight: 600;
        }

        .sp-fit-opt {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .sp-fit-name {
          font-size: 12px;
          color: rgba(0,0,0,0.6);
        }
        .sp-fit-name.sp-active {
          color: #111111;
          font-weight: 650;
        }

        .sp-size-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
        }
        .sp-size-btn {
          height: 40px;
          background: transparent;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(0,0,0,0.6);
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .sp-size-btn:hover { border-color: #111111; }
        .sp-size-btn.sp-selected {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
        }

        .sp-clear-btn {
          margin-top: 24px;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-decoration: underline;
          text-underline-offset: 5px;
          color: rgba(0,0,0,0.55);
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .sp-clear-btn:hover { color: #111111; }

        .sp-grid-area { min-width: 0; }

        .sp-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 52px 20px;
          width: 100%;
        }

        .sp-card { min-width: 0; }
        .sp-card-link {
          display: flex;
          flex-direction: column;
          min-width: 0;
          text-decoration: none;
          color: inherit;
        }
        .sp-card-image {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          border-radius: 10px;
          background: #e9e9e5;
        }
        .sp-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sp-card-link:hover .sp-card-image img {
          transform: scale(1.035);
        }
        .sp-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0,0,0,0.18);
        }
        .sp-card-overlay {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 14px;
          height: 48px;
          background: rgba(255,255,255,0.94);
          color: #111111;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        @media (hover: hover) {
          .sp-card-link:hover .sp-card-overlay {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .sp-card-info { padding-top: 14px; }
        .sp-card-name {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.25;
          letter-spacing: -0.015em;
          color: #111111;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sp-card-price {
          margin-top: 5px;
          font-size: 13px;
          font-weight: 650;
          color: #111111;
        }
        .sp-card-swatches {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 9px;
        }
        .sp-card-swatch {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.16);
          flex-shrink: 0;
        }
        .sp-card-swatch-more {
          font-size: 9px;
          color: rgba(0,0,0,0.4);
        }

        .sp-empty {
          min-height: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .sp-empty-heading {
          font-size: clamp(32px, 4vw, 56px);
          font-weight: 750;
          letter-spacing: -0.05em;
          color: #111111;
        }
        .sp-empty-desc {
          margin-top: 12px;
          font-size: 12px;
          color: rgba(0,0,0,0.45);
        }
        .sp-empty-btn {
          margin-top: 24px;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-decoration: underline;
          text-underline-offset: 5px;
          color: rgba(0,0,0,0.55);
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .sp-empty-btn:hover { color: #111111; }

        .sp-skel-pulse {
          background: rgba(0,0,0,0.06);
          border-radius: 4px;
          animation: spSkelPulse 1.5s ease-in-out infinite;
        }
        @keyframes spSkelPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .sp-skel-img { width: 100%; height: 100%; }
        .sp-skel-name {
          width: 70%;
          height: 12px;
          display: block;
        }
        .sp-skel-price {
          width: 35%;
          height: 10px;
          display: block;
          margin-top: 8px;
        }
        @media (prefers-reduced-motion: reduce) {
          .sp-skel-pulse { animation: none; opacity: 0.1; }
        }

        .sp-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.38);
          z-index: 800;
        }
        .sp-drawer {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: min(420px, 92vw);
          background: #f6f6f3;
          z-index: 801;
          padding: 28px;
          overflow-y: auto;
          transform: translateX(0);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sp-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(0,0,0,0.16);
        }
        .sp-drawer-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #111111;
        }
        .sp-drawer-close {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #111111;
          margin-right: -12px;
        }
        .sp-drawer-body { padding: 24px 0; }
        .sp-drawer-footer {
          position: sticky;
          bottom: 0;
          background: #f6f6f3;
          padding-top: 16px;
        }
        .sp-drawer-show-btn {
          width: 100%;
          height: 56px;
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s ease;
        }
        .sp-drawer-show-btn:hover { background: #282828; }
        .sp-drawer-clear {
          display: block;
          margin: 0 auto 14px;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-decoration: underline;
          text-underline-offset: 5px;
          color: rgba(0,0,0,0.55);
          cursor: pointer;
        }

        @media (max-width: 1279px) {
          .sp-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 40px 16px;
          }
        }

        @media (max-width: 1023px) {
          .sp-layout {
            grid-template-columns: 1fr;
          }
          .sp-sidebar { display: none; }
          .sp-filter-btn { display: inline-flex; }
        }

        @media (min-width: 1024px) {
          .sp-filter-btn-desktop { display: none; }
        }

        @media (max-width: 767px) {
          .sp-page { padding-top: 96px; padding-bottom: 64px; }
          .sp-toolbar { padding: 15px 0; margin-bottom: 24px; }
          .sp-toolbar-left { font-size: 8px; }
          .sp-filter-btn { font-size: 8px; }
          .sp-sort-btn { font-size: 8px; }

          .sp-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 30px 10px;
          }
          .sp-card-image { border-radius: 7px; }
          .sp-card-info { padding-top: 10px; }
          .sp-card-name { font-size: clamp(10px, 3vw, 12px); }
          .sp-card-price { margin-top: 4px; font-size: 11px; }
          .sp-card-swatches { margin-top: 7px; gap: 5px; }
          .sp-card-swatch { width: 8px; height: 8px; }
          .sp-card-overlay { display: none; }
        }

        @media (max-width: 359px) {
          .sp-grid { gap: 20px 8px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .sp-page * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="mizfit-container">
        {/* MAIN LAYOUT */}
        <div className="sp-layout">
          {/* DESKTOP SIDEBAR */}
          <aside className="sp-sidebar" style={anim(160)}>
            <p className="sp-sidebar-title">FILTERS</p>
            {filterContent}
          </aside>

          {/* PRODUCT GRID */}
          <div className="sp-grid-area" style={anim(180)}>
            {loading ? (
              renderSkeleton()
            ) : filteredProducts.length === 0 ? (
              <div className="sp-empty">
                <p className="sp-empty-heading">NO TEES FOUND.</p>
                <p className="sp-empty-desc">Try clearing a few filters.</p>
                <button onClick={clearFilters} className="sp-empty-btn">CLEAR FILTERS</button>
              </div>
            ) : (
              <div className="sp-grid">
                {filteredProducts.map((product, i) => renderProduct(product, i))}
              </div>
            )}
          </div>
        </div>

        {/* FILTER DRAWER — Tablet & Mobile */}
        {filterDrawerOpen && (
          <div role="dialog" aria-modal="true" aria-label="Filter products">
            <div className="sp-backdrop" onClick={() => setFilterDrawerOpen(false)} />
            <div className="sp-drawer" ref={drawerRef} style={{ transform: 'translateX(0)' }}>
              <div className="sp-drawer-header">
                <span className="sp-drawer-title">FILTER PRODUCTS</span>
                <button
                  className="sp-drawer-close"
                  onClick={() => {
                    setFilterDrawerOpen(false)
                    filterBtnRef.current?.focus()
                  }}
                  aria-label="Close filters"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="sp-drawer-body">
                {filterContent}
              </div>
              <div className="sp-drawer-footer">
                {hasActiveFilters && (
                  <button
                    className="sp-drawer-clear"
                    onClick={() => {
                      clearFilters()
                      setFilterDrawerOpen(false)
                    }}
                  >
                    CLEAR ALL
                  </button>
                )}
                <button
                  className="sp-drawer-show-btn"
                  onClick={() => setFilterDrawerOpen(false)}
                >
                  SHOW {filteredProducts.length} PRODUCTS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
