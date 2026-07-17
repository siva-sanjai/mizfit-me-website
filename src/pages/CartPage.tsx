import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utils/helpers'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, total, removeItem, updateQuantity } = useCart()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = (id: string) => {
    setRemovingId(id)
    setTimeout(() => {
      removeItem(id)
      setRemovingId(null)
    }, 350)
  }

  const subtotal = total

  if (items.length === 0) {
    return (
      <div className="cz-page cz-page--empty">
        <style>{`
          .cz-page--empty {
            min-height: 100vh;
            background: #f6f6f3;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 130px 20px 80px;
          }
          .cz-empty {
            text-align: center;
            max-width: 420px;
          }
          .cz-empty-label {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.26em;
            text-transform: uppercase;
            color: rgba(0,0,0,0.4);
          }
          .cz-empty-heading {
            font-size: clamp(52px, 7vw, 100px);
            font-weight: 800;
            line-height: 0.82;
            letter-spacing: -0.06em;
            color: #0a0a0a;
            margin-top: 24px;
          }
          .cz-empty-desc {
            font-size: 13px;
            line-height: 1.6;
            color: rgba(0,0,0,0.5);
            margin-top: 24px;
          }
          .cz-empty-actions {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
            margin-top: 36px;
          }
          .cz-empty-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 50px;
            padding: 0 36px;
            background: #111111;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            cursor: pointer;
            text-decoration: none;
            transition: background 0.25s ease;
          }
          .cz-empty-btn:hover { background: #282828; }
          .cz-empty-link {
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.12em;
            color: rgba(0,0,0,0.5);
            text-decoration: underline;
            text-underline-offset: 4px;
            cursor: pointer;
            transition: color 0.2s ease;
          }
          .cz-empty-link:hover { color: #000000; }

          @media (max-width: 767px) {
            .cz-page--empty { padding: 92px 16px 60px; }
            .cz-empty-heading { font-size: clamp(48px, 16vw, 68px); }
          }

          @media (prefers-reduced-motion: reduce) {
            .cz-fade-in { opacity: 1 !important; transform: none !important; }
          }
        `}</style>
        <div className="cz-empty">
          <p className="cz-empty-label">YOUR BAG / EMPTY</p>
          <h1 className="cz-empty-heading">
            NOTHING<br />HERE YET.
          </h1>
          <p className="cz-empty-desc">
            Your next favourite tee is probably waiting.
          </p>
          <div className="cz-empty-actions">
            <Link to="/shop" className="cz-empty-btn">
              SHOP T-SHIRTS
            </Link>
            <Link to="/customize" className="cz-empty-link">
              CUSTOMIZE YOUR TEE
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cz-page">
      <style>{`
        .cz-page {
          width: 100%;
          min-height: 100vh;
          background: #f6f6f3;
          padding-top: 130px;
          padding-bottom: 100px;
        }

        .cz-intro {
          opacity: 0;
          transform: translateY(18px);
          animation: czFadeUp 0.55s ease forwards;
        }
        .cz-intro-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.45);
        }
        .cz-intro-heading {
          font-size: clamp(52px, 6vw, 88px);
          font-weight: 800;
          line-height: 0.82;
          letter-spacing: -0.06em;
          color: #0a0a0a;
          margin-top: 12px;
        }
        .cz-intro-count {
          margin-top: 20px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: rgba(0,0,0,0.48);
        }
        .cz-intro-bottom {
          margin-top: 48px;
          margin-bottom: 0;
        }

        .cz-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(340px, 0.65fr);
          gap: clamp(40px, 5vw, 80px);
          align-items: start;
          margin-top: 0;
        }

        .cz-items-area {
          min-width: 0;
        }

        .cz-list-header {
          display: grid;
          grid-template-columns: 1fr 130px 120px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(0,0,0,0.16);
        }
        .cz-list-header span {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: rgba(0,0,0,0.42);
          text-transform: uppercase;
        }
        .cz-list-header span:nth-child(2) {
          text-align: center;
        }
        .cz-list-header span:nth-child(3) {
          text-align: right;
        }

        .cz-item {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 130px 120px;
          align-items: center;
          padding: 24px 0;
          border-bottom: 1px solid rgba(0,0,0,0.14);
          opacity: 0;
          transform: translateY(18px);
          animation: czFadeUp 0.55s ease forwards;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .cz-item.cz-removing {
          opacity: 0;
          transform: translateY(-10px) scale(0.97);
          pointer-events: none;
        }
        .cz-item:nth-child(1) { animation-delay: 100ms; }
        .cz-item:nth-child(2) { animation-delay: 180ms; }
        .cz-item:nth-child(3) { animation-delay: 240ms; }
        .cz-item:nth-child(4) { animation-delay: 290ms; }
        .cz-item:nth-child(n+5) { animation-delay: 320ms; }

        .cz-item-product {
          display: grid;
          grid-template-columns: 130px minmax(0, 1fr);
          gap: 24px;
          align-items: center;
        }
        .cz-item-img-wrap {
          width: 130px;
          aspect-ratio: 4 / 5;
          background: #e9e9e5;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .cz-item-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cz-item-info {
          min-width: 0;
        }
        .cz-item-name {
          font-size: clamp(20px, 1.8vw, 28px);
          font-weight: 650;
          letter-spacing: -0.035em;
          line-height: 1.1;
          color: #111111;
        }
        .cz-item-meta {
          margin-top: 12px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.46);
        }
        .cz-item-price-info {
          margin-top: 16px;
          font-size: 14px;
          font-weight: 650;
          color: #111111;
        }

        .cz-custom-badge {
          display: inline-flex;
          margin-top: 14px;
          padding: 6px 9px;
          background: #111111;
          color: #ffffff;
          border-radius: 4px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .cz-artwork-info {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          color: rgba(0,0,0,0.48);
          min-width: 0;
        }
        .cz-artwork-info img {
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 4px;
          background: #eee;
          flex-shrink: 0;
        }
        .cz-artwork-info span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .cz-item-actions {
          margin-top: 18px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .cz-qty {
          display: inline-grid;
          grid-template-columns: 36px 42px 36px;
          height: 38px;
          border: 1px solid rgba(0,0,0,0.16);
          border-radius: 6px;
          overflow: hidden;
          background: transparent;
        }
        .cz-qty-btn {
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          color: #111111;
          transition: background 0.2s ease;
          padding: 0;
        }
        .cz-qty-btn:hover { background: rgba(0,0,0,0.05); }
        .cz-qty-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }
        .cz-qty-btn:disabled:hover { background: transparent; }
        .cz-qty-val {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #111111;
          border-left: 1px solid rgba(0,0,0,0.08);
          border-right: 1px solid rgba(0,0,0,0.08);
        }
        .cz-remove-btn {
          background: transparent;
          border: none;
          padding: 0;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(0,0,0,0.46);
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .cz-remove-btn:hover { color: #000000; }

        .cz-item-total {
          font-size: 16px;
          font-weight: 650;
          text-align: right;
          letter-spacing: -0.02em;
          color: #111111;
          transition: opacity 0.2s ease;
        }

        .cz-summary {
          position: sticky;
          top: 110px;
          background: #111111;
          color: #ffffff;
          border-radius: 16px;
          padding: 32px;
          opacity: 0;
          transform: translateY(18px);
          animation: czFadeUp 0.55s ease forwards;
          animation-delay: 220ms;
        }
        .cz-summary-heading {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }
        .cz-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .cz-summary-row:first-of-type { padding-top: 24px; }
        .cz-summary-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.48);
          flex-shrink: 0;
        }
        .cz-summary-value {
          font-size: 13px;
          font-weight: 600;
          text-align: right;
          color: #ffffff;
        }
        .cz-summary-total {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 28px;
        }
        .cz-summary-total-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.55);
        }
        .cz-summary-total-price {
          font-size: clamp(32px, 3vw, 46px);
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 1;
          color: #ffffff;
        }

        .cz-checkout-btn {
          width: 100%;
          height: 56px;
          margin-top: 30px;
          background: #ffffff;
          color: #111111;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s ease;
        }
        .cz-checkout-btn:hover { background: #f0f0ed; }
        .cz-checkout-btn svg {
          transition: transform 0.25s ease;
        }
        .cz-checkout-btn:hover svg {
          transform: translateX(4px);
        }

        .cz-continue-link {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.55);
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .cz-continue-link:hover { color: #ffffff; }

        .cz-trust {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.12);
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-align: center;
          color: rgba(255,255,255,0.35);
        }

        @keyframes czFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1023px) {
          .cz-layout {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .cz-summary {
            position: static;
            width: 100%;
          }
        }

        @media (max-width: 767px) {
          .cz-page {
            padding-top: 92px;
            padding-bottom: 48px;
          }
          .cz-intro-bottom { margin-top: 36px; }
          .cz-intro-heading { font-size: clamp(48px, 16vw, 68px); }
          .cz-list-header { display: none; }

          .cz-item {
            grid-template-columns: 96px minmax(0, 1fr);
            gap: 16px;
            align-items: start;
            padding: 20px 0;
          }
          .cz-item-total { display: none; }

          .cz-item-product {
            grid-template-columns: 1fr;
            gap: 0;
            grid-column: 1 / -1;
            display: contents;
          }
          .cz-item-img-wrap {
            width: 96px;
            aspect-ratio: 4 / 5;
            border-radius: 8px;
            grid-row: span 2;
          }
          .cz-item-info {
            min-width: 0;
          }
          .cz-item-name {
            font-size: 18px;
          }
          .cz-item-meta {
            margin-top: 8px;
            font-size: 9px;
          }
          .cz-item-price-info {
            margin-top: 12px;
            font-size: 13px;
          }
          .cz-item-actions {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 16px;
            gap: 12px;
          }
          .cz-artwork-info {
            font-size: 9px;
          }
          .cz-artwork-info img {
            width: 22px;
            height: 22px;
          }

          .cz-summary {
            border-radius: 14px;
            padding: 24px 20px;
          }
          .cz-summary-total-price {
            font-size: 36px;
          }
          .cz-checkout-btn {
            height: 54px;
          }
        }

        @media (max-width: 359px) {
          .cz-item {
            grid-template-columns: 80px minmax(0, 1fr);
            gap: 12px;
          }
          .cz-item-img-wrap { width: 80px; }
          .cz-item-name { font-size: 16px; }
          .cz-qty { grid-template-columns: 32px 36px 32px; height: 34px; }
          .cz-qty-val { font-size: 11px; }
          .cz-qty-btn { font-size: 14px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cz-intro { opacity: 1; transform: none; animation: none; }
          .cz-item { opacity: 1; transform: none; animation: none; }
          .cz-summary { opacity: 1; transform: none; animation: none; }
        }
      `}</style>

      <div className="mizfit-container">
        {/* INTRO */}
        <div className="cz-intro">
          <p className="cz-intro-label">YOUR BAG / MIZFIT</p>
          <h1 className="cz-intro-heading">
            YOUR
            <br />
            BAG.
          </h1>
          <p className="cz-intro-count">{items.length} ITEMS</p>
          <div className="cz-intro-bottom" />
        </div>

        {/* LAYOUT */}
        <div className="cz-layout">
          {/* CART ITEMS */}
          <div className="cz-items-area">
            <div className="cz-list-header">
              <span>Product</span>
              <span>Qty</span>
              <span>Total</span>
            </div>

            {items.map((item) => {
              const metaParts: string[] = []
              if (item.color) metaParts.push(item.color.toUpperCase())
              if (item.size) metaParts.push(item.size.toUpperCase())
              if (item.printSide && !item.designFileName) metaParts.push(`${item.printSide.toUpperCase()} PRINT`)

              const lineTotal = item.itemPrice * item.quantity

              return (
                <div
                  key={item.id}
                  className={`cz-item${removingId === item.id ? ' cz-removing' : ''}`}
                  role="listitem"
                >
                  {/* PRODUCT INFO (left column) */}
                  <div className="cz-item-product">
                    <div className="cz-item-img-wrap">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="cz-item-info">
                      <p className="cz-item-name">{item.product.name}</p>
                      <p className="cz-item-meta">{metaParts.join(' / ')}</p>
                      <p className="cz-item-price-info">{formatPrice(item.itemPrice)}</p>

                      {/* CUSTOM ORDER INFO */}
                      {(item.designPreview || item.designFileName) && (
                        <>
                          <span className="cz-custom-badge">CUSTOM DESIGN</span>
                          {item.designFileName && (
                            <div className="cz-artwork-info">
                              {item.designPreview && (
                                <img src={item.designPreview} alt="Artwork preview" />
                              )}
                              <span>ARTWORK / {item.designFileName}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* ACTIONS */}
                      <div className="cz-item-actions">
                        <div className="cz-qty">
                          <button
                            className="cz-qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
                              <path d="M0 1h12" stroke="currentColor" strokeWidth="1.2" />
                            </svg>
                          </button>
                          <span className="cz-qty-val" aria-live="polite">{item.quantity}</span>
                          <button
                            className="cz-qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.2" />
                            </svg>
                          </button>
                        </div>

                        <button
                          className="cz-remove-btn"
                          onClick={() => handleRemove(item.id)}
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QUANTITY (desktop middle column) — hidden on mobile, shown via grid column */}
                  <div />

                  {/* LINE TOTAL (right column) */}
                  <div className="cz-item-total">{formatPrice(lineTotal)}</div>
                </div>
              )
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="cz-summary">
            <p className="cz-summary-heading">ORDER SUMMARY</p>

            <div className="cz-summary-row">
              <span className="cz-summary-label">SUBTOTAL</span>
              <span className="cz-summary-value">{formatPrice(subtotal)}</span>
            </div>
            <div className="cz-summary-row">
              <span className="cz-summary-label">SHIPPING</span>
              <span className="cz-summary-value">CALCULATED AT CHECKOUT</span>
            </div>

            <div className="cz-summary-total">
              <span className="cz-summary-total-label">TOTAL</span>
              <span className="cz-summary-total-price">{formatPrice(subtotal)}</span>
            </div>

            <button
              className="cz-checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              PROCEED TO CHECKOUT
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M10 1l5 5m0 0l-5 5m5-5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <Link to="/shop" className="cz-continue-link">
              CONTINUE SHOPPING
            </Link>

            <p className="cz-trust">
              SECURE CHECKOUT · ARTWORK HANDLED WITH CARE
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
