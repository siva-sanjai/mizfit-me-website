import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import type { Product } from '@/types'
import { getProductById } from '@/services/products'
import { formatPrice } from '@/utils/helpers'
import { useCart } from '@/hooks/useCart'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

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

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
]

function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="pp-accordion">
      <button
        onClick={onToggle}
        className="pp-accordion-trigger"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" style={{ transition: 'opacity 0.25s ease', opacity: isOpen ? 0 : 1 }} />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div
        className="pp-accordion-content"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          opacity: isOpen ? 1 : 0,
          transition: 'grid-template-rows 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
        }}
      >
        <div ref={contentRef} className="pp-accordion-inner">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [sizeError, setSizeError] = useState('')
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    details: true,
    fit: false,
    care: false,
    shipping: false,
  })
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const sizeGuideRef = useRef<HTMLDivElement>(null)
  const sizeGuideBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!id) return
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProductById(id)
        if (!data) throw new Error('Product not found')
        setProduct(data)
        if (data.available_colors.length > 0) setSelectedColor(data.available_colors[0])
        if (data.available_sizes.length > 0) setSelectedSize(data.available_sizes[0])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  // Focus trap for size guide
  useEffect(() => {
    if (!sizeGuideOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSizeGuideOpen(false)
        sizeGuideBtnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    const first = sizeGuideRef.current?.querySelector<HTMLElement>('button, [tabindex]')
    first?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sizeGuideOpen])

  const handleCustomize = () => {
    if (!product) return
    navigate(`/customize?productId=${product.id}&color=${selectedColor}&size=${selectedSize}`)
  }

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleAddToCart = useCallback(() => {
    if (!product) return
    if (!selectedSize) {
      setSizeError('SELECT A SIZE TO CONTINUE.')
      return
    }
    setSizeError('')
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}-${Date.now()}`,
      product,
      color: selectedColor,
      size: selectedSize,
      quantity,
      printSide: 'front',
      designPreview: null,
      designFile: null,
      designFileName: '',
      itemPrice: product.base_price,
    })
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }, [product, selectedColor, selectedSize, quantity, addItem])

  const anim = (delay: number) =>
    mounted
      ? { opacity: 1, transform: 'translateY(0)', transition: `opacity 0.6s ease, transform 0.6s ease ${delay}ms` }
      : { opacity: 0, transform: 'translateY(16px)' }

  if (loading) {
    return (
      <div className="pp-page">
        <style>{`
          .pp-page {
            width: 100%;
            background: #f6f6f3;
            min-height: 100vh;
            padding-top: 128px;
            padding-bottom: 100px;
          }
          .pp-skel-pulse {
            background: rgba(0,0,0,0.06);
            border-radius: 4px;
            animation: ppSkelPulse 1.5s ease-in-out infinite;
          }
          @keyframes ppSkelPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          @media (prefers-reduced-motion: reduce) {
            .pp-skel-pulse { animation: none; opacity: 0.1; }
          }
        `}</style>
        <div className="mizfit-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(440px,0.95fr)', gap: 'clamp(56px,7vw,110px)', alignItems: 'start' }}>
            <div>
              <div className="pp-skel-pulse" style={{ aspectRatio: '4/5', borderRadius: '12px', maxHeight: '760px' }} />
            </div>
            <div>
              <div className="pp-skel-pulse" style={{ width: '30%', height: 10, marginBottom: 24 }} />
              <div className="pp-skel-pulse" style={{ width: '60%', height: 28, marginBottom: 16 }} />
              <div className="pp-skel-pulse" style={{ width: '20%', height: 14, marginBottom: 24 }} />
              <div className="pp-skel-pulse" style={{ width: '100%', height: 10, marginBottom: 8 }} />
              <div className="pp-skel-pulse" style={{ width: '80%', height: 10, marginBottom: 34 }} />
              <div className="pp-skel-pulse" style={{ width: '100%', height: 60, marginBottom: 16 }} />
              <div className="pp-skel-pulse" style={{ width: '100%', height: 60, marginBottom: 16 }} />
              <div className="pp-skel-pulse" style={{ width: '100%', height: 58 }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="pp-page">
        <div className="mizfit-container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 750, letterSpacing: '-0.05em', color: '#111' }}>
              TEE NOT FOUND.
            </p>
            <p style={{ marginTop: 12, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              Looks like this one left the rack.
            </p>
            <Link
              to="/shop"
              style={{
                marginTop: 28,
                display: 'inline-flex',
                alignItems: 'center',
                height: 50,
                padding: '0 28px',
                background: '#111',
                color: '#fff',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              BACK TO SHOP
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isOutOfStock = product.stock_status === 'out_of_stock'
  const images = product.images.length > 0 ? product.images : FALLBACK_IMAGES
  const currentImage = images[selectedImage] || images[0]

  return (
    <div className="pp-page">
      <style>{`
        .pp-page {
          width: 100%;
          background: #f6f6f3;
          color: #111111;
          padding-top: 128px;
          padding-bottom: 100px;
          min-height: 100vh;
        }

        .pp-back {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.52);
          cursor: pointer;
          text-decoration: none;
          transition: color 0.25s ease;
        }
        .pp-back:hover { color: #111111; }
        .pp-back svg { transition: transform 0.25s ease; }
        .pp-back:hover svg { transform: translateX(-3px); }

        .pp-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(440px, 0.95fr);
          gap: clamp(56px, 7vw, 110px);
          align-items: start;
        }

        .pp-media { min-width: 0; }
        .pp-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          max-height: 760px;
          overflow: hidden;
          background: #e8e8e4;
          border-radius: 12px;
        }
        .pp-image-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pp-image-wrap:hover img {
          transform: scale(1.025);
        }

        .pp-thumbs {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          overflow-x: auto;
        }
        .pp-thumb {
          flex-shrink: 0;
          width: 64px;
          height: 80px;
          overflow: hidden;
          border-radius: 6px;
          background: #e8e8e4;
          border: 1px solid transparent;
          cursor: pointer;
          padding: 0;
          transition: border-color 0.25s ease, opacity 0.25s ease;
        }
        .pp-thumb.pp-thumb-active { border-color: #111111; opacity: 1; }
        .pp-thumb:not(.pp-thumb-active) { opacity: 0.55; }
        .pp-thumb:not(.pp-thumb-active):hover { opacity: 0.85; }
        .pp-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .pp-info {
          position: sticky;
          top: 130px;
          align-self: start;
          padding-top: 8px;
          min-width: 0;
        }

        .pp-fit-label {
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }
        .pp-name {
          margin-top: 16px;
          font-size: clamp(42px, 4vw, 68px);
          font-weight: 750;
          line-height: 0.92;
          letter-spacing: -0.055em;
          color: #111111;
        }
        .pp-price {
          margin-top: 20px;
          font-size: clamp(24px, 2vw, 32px);
          font-weight: 650;
          letter-spacing: -0.035em;
          color: #111111;
        }
        .pp-desc {
          margin-top: 20px;
          max-width: 520px;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(0,0,0,0.56);
          margin-bottom: 34px;
        }

        .pp-option-divider {
          border-top: 1px solid rgba(0,0,0,0.16);
        }

        .pp-color-section {
          padding: 26px 0;
          border-bottom: 1px solid rgba(0,0,0,0.14);
        }
        .pp-color-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .pp-color-header-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: rgba(0,0,0,0.42);
        }
        .pp-color-header-value {
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.12em;
          color: #111111;
        }
        .pp-swatches {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .pp-swatch-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          padding: 4px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .pp-swatch-btn.pp-swatch-selected {
          border-color: #111111;
        }
        .pp-swatch-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.16);
          display: block;
        }

        .pp-size-section {
          padding: 26px 0;
          border-bottom: 1px solid rgba(0,0,0,0.14);
        }
        .pp-size-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .pp-size-header-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: rgba(0,0,0,0.42);
        }
        .pp-size-guide-btn {
          background: transparent;
          border: none;
          padding: 0;
          font-size: 8px;
          font-weight: 650;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.5);
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .pp-size-guide-btn:hover { color: #111111; }
        .pp-size-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pp-size-btn {
          min-width: 52px;
          height: 48px;
          padding: 0 14px;
          background: transparent;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 5px;
          font-size: 10px;
          font-weight: 650;
          color: rgba(0,0,0,0.62);
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .pp-size-btn:hover { border-color: #111111; }
        .pp-size-btn.pp-size-selected {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
        }
        .pp-size-btn.pp-size-disabled {
          opacity: 0.35;
          cursor: not-allowed;
          text-decoration: line-through;
        }
        .pp-size-btn.pp-size-disabled:hover { border-color: rgba(0,0,0,0.18); }
        .pp-size-error {
          margin-top: 12px;
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.1em;
          color: #9f2f2f;
        }

        .pp-details-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          padding: 26px 0;
          border-bottom: 1px solid rgba(0,0,0,0.14);
          gap: 18px;
        }
        .pp-detail-label {
          font-size: 8px;
          font-weight: 650;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }
        .pp-detail-value {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 550;
          line-height: 1.45;
          color: #111111;
        }

        .pp-qty-section {
          padding: 26px 0 18px;
        }
        .pp-qty-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: rgba(0,0,0,0.42);
          margin-bottom: 14px;
        }
        .pp-qty {
          display: inline-grid;
          grid-template-columns: 48px 54px 48px;
          height: 48px;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 5px;
          overflow: hidden;
        }
        .pp-qty-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #111111;
          padding: 0;
          transition: background 0.2s ease;
        }
        .pp-qty-btn:hover { background: rgba(0,0,0,0.04); }
        .pp-qty-btn:disabled { opacity: 0.25; cursor: not-allowed; }
        .pp-qty-btn:disabled:hover { background: transparent; }
        .pp-qty-val {
          display: flex;
          align-items: center;
          justify-content: center;
          border-left: 1px solid rgba(0,0,0,0.14);
          border-right: 1px solid rgba(0,0,0,0.14);
          font-size: 12px;
          font-weight: 650;
        }

        .pp-add-to-cart {
          width: 100%;
          height: 62px;
          margin-top: 12px;
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          cursor: pointer;
          transition: background 0.25s ease;
        }
        .pp-add-to-cart:hover:not(:disabled) { background: #292929; }
        .pp-add-to-cart:disabled { opacity: 0.4; cursor: not-allowed; }
        .pp-add-to-cart-left {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pp-add-to-cart-left svg { transition: transform 0.25s ease; }
        .pp-add-to-cart:hover:not(:disabled) .pp-add-to-cart-left svg { transform: translateX(4px); }
        .pp-add-to-cart-right {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .pp-customize-btn {
          width: 100%;
          height: 56px;
          margin-top: 10px;
          background: transparent;
          color: #111111;
          border: 1px solid #111111;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .pp-customize-btn:hover:not(:disabled) {
          background: #111111;
          color: #ffffff;
        }
        .pp-customize-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pp-customize-btn svg { transition: transform 0.25s ease; }
        .pp-customize-btn:hover:not(:disabled) svg { transform: translate(3px, -3px); }

        .pp-added-feedback {
          margin-top: 14px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #111111;
          text-align: center;
        }

        .pp-accordions { margin-top: 48px; }
        .pp-accordion { border-top: 1px solid rgba(0,0,0,0.14); }
        .pp-accordion:last-child { border-bottom: 1px solid rgba(0,0,0,0.14); }
        .pp-accordion-trigger {
          width: 100%;
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #111111;
        }
        .pp-accordion-content {
          display: grid;
        }
        .pp-accordion-inner {
          overflow: hidden;
          padding: 20px 0 26px;
          font-size: 12px;
          line-height: 1.75;
          color: rgba(0,0,0,0.58);
        }
        .pp-accordion-inner ul { list-style: none; padding: 0; margin: 0; }
        .pp-accordion-inner li { padding: 3px 0; }

        .pp-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pp-modal {
          background: #f6f6f3;
          width: min(620px, calc(100% - 32px));
          max-height: 85vh;
          overflow-y: auto;
          border-radius: 10px;
          padding: 32px;
          position: relative;
        }
        .pp-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #111111;
        }
        .pp-modal-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .pp-modal-body { font-size: 12px; line-height: 1.7; color: rgba(0,0,0,0.58); }

        .pp-mobile-bar {
          display: none;
        }

        @media (max-width: 1023px) {
          .pp-layout {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .pp-info { position: static; }
          .pp-image-wrap { max-height: none; }
        }

        @media (max-width: 767px) {
          .pp-page { padding-top: 92px; padding-bottom: 100px; }
          .pp-back { margin-bottom: 20px; font-size: 8px; }
          .pp-layout { gap: 32px; }
          .pp-image-wrap { border-radius: 8px; }
          .pp-name { font-size: clamp(38px, 12vw, 54px); }
          .pp-price { font-size: 25px; }
          .pp-desc { font-size: 13px; line-height: 1.65; margin-bottom: 24px; }
          .pp-color-section { padding: 24px 0; }
          .pp-swatch-btn { width: 36px; height: 36px; }
          .pp-size-btn { min-width: 48px; height: 46px; padding: 0 12px; }
          .pp-qty { grid-template-columns: 48px 56px 48px; height: 50px; }
          .pp-add-to-cart { height: 58px; padding: 0 18px; }
          .pp-customize-btn { height: 54px; padding: 0 18px; }
          .pp-accordion-trigger { min-height: 58px; font-size: 8px; }
          .pp-accordion-inner { font-size: 12px; }
          .pp-mobile-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 900;
            background: #ffffff;
            border-top: 1px solid rgba(0,0,0,0.1);
            padding: 12px 16px;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
          }
          .pp-mobile-bar-price { font-size: 18px; font-weight: 700; }
          .pp-mobile-bar-btn {
            flex: 1;
            max-width: 200px;
            height: 50px;
            background: #111111;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            cursor: pointer;
          }
          .pp-mobile-bar-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        }

        @media (max-width: 480px) {
          .pp-details-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .pp-details-grid > div {
            padding: 14px 0;
            border-bottom: 1px solid rgba(0,0,0,0.1);
          }
          .pp-details-grid > div:last-child { border-bottom: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pp-page * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="mizfit-container">
        {/* BACK */}
        <Link to="/shop" className="pp-back" style={anim(0)}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 5H1M5 9L1 5l4-4" />
          </svg>
          BACK TO SHOP
        </Link>

        {/* MAIN LAYOUT */}
        <div className="pp-layout">
          {/* LEFT — MEDIA */}
          <div className="pp-media" style={anim(0)}>
            <div className="pp-image-wrap">
              <img
                src={currentImage}
                alt={product.name}
                loading="eager"
              />
            </div>
            {images.length > 1 && (
              <div className="pp-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`pp-thumb${selectedImage === idx ? ' pp-thumb-active' : ''}`}
                    aria-label={`${product.name} image ${idx + 1}`}
                  >
                    <img src={img} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — INFO */}
          <div className="pp-info" style={anim(0)}>
            <p className="pp-fit-label" style={anim(100)}>{product.fit_type} / MIZFIT</p>
            <h1 className="pp-name" style={anim(150)}>{product.name}</h1>
            <p className="pp-price" style={anim(220)}>{formatPrice(product.base_price)}</p>
            {product.description && (
              <p className="pp-desc" style={anim(220)}>{product.description}</p>
            )}

            <div className="pp-option-divider" style={anim(280)} />

            {/* COLOR */}
            <div className="pp-color-section" style={anim(280)}>
              <div className="pp-color-header">
                <span className="pp-color-header-label">COLOR</span>
                <span className="pp-color-header-value">{selectedColor.toUpperCase()}</span>
              </div>
              <div className="pp-swatches" role="radiogroup" aria-label="Color">
                {product.available_colors.map(cName => (
                  <button
                    key={cName}
                    onClick={() => setSelectedColor(cName)}
                    className={`pp-swatch-btn${selectedColor === cName ? ' pp-swatch-selected' : ''}`}
                    role="radio"
                    aria-checked={selectedColor === cName}
                    aria-label={cName}
                  >
                    <span className="pp-swatch-inner" style={{ backgroundColor: COLOR_MAP[cName] || '#ccc' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE */}
            <div className="pp-size-section" style={anim(280)}>
              <div className="pp-size-header">
                <span className="pp-size-header-label">SIZE</span>
                <button
                  ref={sizeGuideBtnRef}
                  className="pp-size-guide-btn"
                  onClick={() => setSizeGuideOpen(true)}
                >
                  SIZE GUIDE ↗
                </button>
              </div>
              <div className="pp-size-options" role="radiogroup" aria-label="Size">
                {SIZES.map(size => {
                  const available = product.available_sizes.includes(size)
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (available) {
                          setSelectedSize(size)
                          setSizeError('')
                        }
                      }}
                      disabled={!available}
                      className={
                        `pp-size-btn` +
                        (isSelected && available ? ' pp-size-selected' : '') +
                        (!available ? ' pp-size-disabled' : '')
                      }
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Size ${size}`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {sizeError && <p className="pp-size-error">{sizeError}</p>}
            </div>

            {/* QUICK DETAILS */}
            <div className="pp-details-grid" style={anim(280)}>
              <div>
                <p className="pp-detail-label">FIT</p>
                <p className="pp-detail-value">{product.fit_type}</p>
              </div>
              <div>
                <p className="pp-detail-label">MATERIAL</p>
                <p className="pp-detail-value">{product.material}</p>
              </div>
              <div>
                <p className="pp-detail-label">AVAILABILITY</p>
                <p className="pp-detail-value">
                  {product.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>

            {/* QUANTITY */}
            <div className="pp-qty-section" style={anim(280)}>
              <p className="pp-qty-label">QUANTITY</p>
              <div className="pp-qty">
                <button
                  className="pp-qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <svg width="12" height="2" viewBox="0 0 12 2" fill="none"><path d="M0 1h12" stroke="currentColor" strokeWidth="1.5" /></svg>
                </button>
                <span className="pp-qty-val" aria-live="polite">{quantity}</span>
                <button
                  className="pp-qty-btn"
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  disabled={quantity >= 99}
                  aria-label="Increase quantity"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" /></svg>
                </button>
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              className="pp-add-to-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={anim(340)}
              aria-label={addedFeedback ? 'Added to cart' : `Add ${product.name} to cart`}
            >
              <span className="pp-add-to-cart-left">
                {addedFeedback ? 'ADDED TO CART' : 'ADD TO CART'}
                <svg width="14" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 1l5 5-5 5M15 6H1" />
                </svg>
              </span>
              <span className="pp-add-to-cart-right">{formatPrice(product.base_price * quantity)}</span>
            </button>

            {/* CUSTOMIZE */}
            <button
              className="pp-customize-btn"
              onClick={handleCustomize}
              disabled={isOutOfStock}
              style={anim(340)}
            >
              CUSTOMIZE THIS TEE
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l10-10M7 7h10v10" />
              </svg>
            </button>

            {addedFeedback && (
              <p className="pp-added-feedback" style={anim(0)}>ADDED TO CART ✓</p>
            )}

            {/* ACCORDIONS */}
            <div className="pp-accordions" style={anim(340)}>
              <AccordionSection
                title="PRODUCT DETAILS"
                isOpen={openAccordions.details}
                onToggle={() => toggleAccordion('details')}
              >
                <ul>
                  <li>MATERIAL — {product.material}</li>
                  <li>FIT — {product.fit_type}</li>
                  <li>COLORS — {product.available_colors.length} AVAILABLE</li>
                  <li>{product.stock_status === 'in_stock' ? 'IN STOCK — READY TO SHIP' : 'CURRENTLY OUT OF STOCK'}</li>
                </ul>
              </AccordionSection>

              <AccordionSection
                title="SIZE & FIT"
                isOpen={openAccordions.fit}
                onToggle={() => toggleAccordion('fit')}
              >
                <ul>
                  <li>{product.fit_type} — relaxed, street-ready silhouette</li>
                  <li>Model is 6'0" wearing size M for a standard fit</li>
                  <li>Refer to our Size Guide for exact measurements</li>
                  <li>Available in XS through XXL</li>
                </ul>
              </AccordionSection>

              <AccordionSection
                title="WASH CARE"
                isOpen={openAccordions.care}
                onToggle={() => toggleAccordion('care')}
              >
                <ul>
                  <li>Machine wash cold with like colors</li>
                  <li>Tumble dry low or hang dry for best results</li>
                  <li>Do not bleach or use fabric softeners</li>
                  <li>Iron inside out on low heat if needed</li>
                </ul>
              </AccordionSection>

              <AccordionSection
                title="SHIPPING & RETURNS"
                isOpen={openAccordions.shipping}
                onToggle={() => toggleAccordion('shipping')}
              >
                <ul>
                  <li>Free standard shipping on orders above ₹999</li>
                  <li>Estimated delivery: 5–8 business days</li>
                  <li>Easy 7-day return policy — unused with tags</li>
                  <li>Customized items are final sale</li>
                </ul>
              </AccordionSection>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BAR */}
      <div className="pp-mobile-bar">
        <span className="pp-mobile-bar-price">{formatPrice(product.base_price)}</span>
        <button
          className="pp-mobile-bar-btn"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
        </button>
      </div>

      {/* SIZE GUIDE MODAL */}
      {sizeGuideOpen && (
        <div
          className="pp-modal-backdrop"
          onClick={() => {
            setSizeGuideOpen(false)
            sizeGuideBtnRef.current?.focus()
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
        >
          <div className="pp-modal" ref={sizeGuideRef} onClick={e => e.stopPropagation()}>
            <button
              className="pp-modal-close"
              onClick={() => {
                setSizeGuideOpen(false)
                sizeGuideBtnRef.current?.focus()
              }}
              aria-label="Close size guide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <p className="pp-modal-title">SIZE GUIDE</p>
            <div className="pp-modal-body">
              <p>SIZE GUIDE DETAILS COMING SOON.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
