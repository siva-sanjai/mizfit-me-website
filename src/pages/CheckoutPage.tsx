import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { createOrder } from '@/services/api'
import { formatPrice, validateEmail, validatePhone } from '@/utils/helpers'
import type { CheckoutFormData } from '@/types'

const paymentMethods = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'PAY WHEN YOUR ORDER ARRIVES' },
  { value: 'upi', label: 'UPI', desc: 'COMPLETE PAYMENT AFTER ORDER CONFIRMATION' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clear } = useCart()

  const [form, setForm] = useState<CheckoutFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    payment_method: 'cod',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {}

    if (!form.customer_name.trim()) newErrors.customer_name = 'Enter your full name.'
    if (!form.customer_email.trim()) newErrors.customer_email = 'Enter your email address.'
    else if (!validateEmail(form.customer_email)) newErrors.customer_email = 'Enter a valid email address.'
    if (!form.customer_phone.trim()) newErrors.customer_phone = 'Enter your phone number.'
    else if (!validatePhone(form.customer_phone)) newErrors.customer_phone = 'Enter a valid phone number.'
    if (!form.address.trim()) newErrors.address = 'Enter your shipping address.'
    if (!form.city.trim()) newErrors.city = 'Enter your city.'
    if (!form.state.trim()) newErrors.state = 'Enter your state.'
    if (!form.postal_code.trim()) newErrors.postal_code = 'Enter your postal code.'
    else if (!/^\d{6}$/.test(form.postal_code.trim())) newErrors.postal_code = 'Enter a valid 6-digit PIN code.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) return

    setLoading(true)
    try {
      const result = await createOrder({
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        address: form.address,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        payment_method: form.payment_method,
        total_amount: total,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          print_side: item.printSide,
          design_file: item.designFile,
        })),
      })
      clear()
      navigate(`/order-success/${result.order.order_number}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="co-page">
      <style>{`
        .co-page {
          width: 100%;
          min-height: 100vh;
          background: #f6f6f3;
          padding-top: 130px;
          padding-bottom: 100px;
        }

        .co-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(380px, 0.65fr);
          gap: clamp(48px, 6vw, 96px);
          align-items: start;
        }

        .co-form-wrap {
          min-width: 0;
        }
        .co-form {
          width: 100%;
        }

        .co-section {
          padding: 32px 0 40px;
          border-top: 1px solid rgba(0,0,0,0.16);
        }
        .co-section:last-of-type {
          border-bottom: 1px solid rgba(0,0,0,0.16);
        }

        .co-section-header {
          display: flex;
          align-items: baseline;
          gap: 18px;
          margin-bottom: 28px;
        }
        .co-section-num {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(0,0,0,0.38);
        }
        .co-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #111111;
        }

        .co-field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px 18px;
        }
        .co-field-grid .co-span-2 {
          grid-column: span 2;
        }

        .co-field-group {
          display: flex;
          flex-direction: column;
        }
        .co-field-label {
          display: block;
          margin-bottom: 9px;
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.5);
        }
        .co-input {
          width: 100%;
          height: 54px;
          padding: 0 16px;
          background: transparent;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          color: #111111;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .co-input:focus {
          border-color: #111111;
          background: rgba(255,255,255,0.5);
        }
        .co-input::placeholder {
          color: rgba(0,0,0,0.28);
          font-size: 12px;
        }
        .co-input.co-invalid {
          border-color: rgba(159,47,47,0.65);
        }

        .co-textarea {
          width: 100%;
          min-height: 110px;
          padding: 16px;
          background: transparent;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 6px;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.6;
          color: #111111;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .co-textarea:focus {
          border-color: #111111;
          background: rgba(255,255,255,0.5);
        }
        .co-textarea::placeholder {
          color: rgba(0,0,0,0.28);
          font-size: 12px;
        }
        .co-textarea.co-invalid {
          border-color: rgba(159,47,47,0.65);
        }

        .co-phone-wrap {
          display: flex;
          align-items: center;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 6px;
          overflow: hidden;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .co-phone-wrap:focus-within {
          border-color: #111111;
          background: rgba(255,255,255,0.5);
        }
        .co-phone-wrap.co-invalid {
          border-color: rgba(159,47,47,0.65);
        }
        .co-phone-prefix {
          flex-shrink: 0;
          padding: 0 0 0 16px;
          font-size: 13px;
          font-weight: 600;
          color: #111111;
          line-height: 54px;
          user-select: none;
        }
        .co-phone-wrap .co-input {
          border: none;
          height: 54px;
          padding: 0 16px 0 8px;
          flex: 1;
          min-width: 0;
        }
        .co-phone-wrap .co-input:focus {
          background: transparent;
        }

        .co-error-text {
          margin-top: 7px;
          font-size: 10px;
          line-height: 1.4;
          color: #9f2f2f;
        }

        .co-payment-options {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .co-payment-option {
          width: 100%;
          min-height: 64px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(0,0,0,0.16);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          margin-bottom: 10px;
          transition: border-color 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
        }
        .co-payment-option.co-selected {
          border-color: #111111;
          background: rgba(255,255,255,0.55);
        }
        .co-payment-left {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .co-payment-title {
          font-size: 12px;
          font-weight: 600;
          color: #111111;
        }
        .co-payment-desc {
          font-size: 8px;
          letter-spacing: 0.06em;
          color: rgba(0,0,0,0.45);
        }
        .co-payment-indicator {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.35);
          flex-shrink: 0;
          transition: border-width 0.2s ease;
        }
        .co-payment-option.co-selected .co-payment-indicator {
          border: 5px solid #111111;
        }
        .co-payment-radio {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        .co-submit-error {
          padding: 14px;
          margin-top: 28px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          font-size: 10px;
          line-height: 1.5;
          color: rgba(255,255,255,0.72);
          background: transparent;
        }

        .co-summary {
          position: sticky;
          top: 110px;
          background: #111111;
          color: #ffffff;
          border-radius: 16px;
          padding: 32px;
          overflow: hidden;
          opacity: 0;
          transform: translateY(18px);
          animation: coFadeUp 0.6s ease forwards;
          animation-delay: 200ms;
        }
        .co-summary-heading {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .co-summary-count {
          margin-top: 8px;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.3);
          margin-bottom: 28px;
        }
        .co-summary-products {
          display: flex;
          flex-direction: column;
        }
        .co-summary-product {
          display: grid;
          grid-template-columns: 76px minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
          padding: 18px 0;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .co-summary-product:first-child {
          border-top: none;
          padding-top: 0;
        }
        .co-summary-prod-img {
          width: 76px;
          aspect-ratio: 4 / 5;
          object-fit: cover;
          border-radius: 7px;
          background: #e9e9e5;
          display: block;
        }
        .co-summary-prod-info {
          min-width: 0;
        }
        .co-summary-prod-name {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.25;
          color: #ffffff;
        }
        .co-summary-prod-meta {
          margin-top: 7px;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.42);
        }
        .co-summary-prod-qty {
          margin-top: 8px;
          font-size: 9px;
          color: rgba(255,255,255,0.5);
        }
        .co-summary-prod-custom-badge {
          display: inline-flex;
          margin-top: 10px;
          padding: 5px 7px;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 3px;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.75);
        }
        .co-summary-prod-artwork {
          font-size: 8px;
          color: rgba(255,255,255,0.4);
          margin-top: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
        .co-summary-prod-price {
          font-size: 13px;
          font-weight: 650;
          color: #ffffff;
          white-space: nowrap;
          text-align: right;
        }

        .co-summary-subtotal {
          padding: 22px 0;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .co-summary-subtotal-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.45);
        }
        .co-summary-subtotal-value {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
        }
        .co-summary-shipping {
          display: flex;
          justify-content: space-between;
          padding-bottom: 4px;
        }
        .co-summary-shipping-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.45);
        }
        .co-summary-shipping-value {
          font-size: 9px;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          text-align: right;
        }

        .co-summary-total {
          padding-top: 28px;
          margin-top: 4px;
          border-top: 1px solid rgba(255,255,255,0.18);
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .co-summary-total-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.5);
        }
        .co-summary-total-price {
          font-size: clamp(34px, 3vw, 46px);
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 1;
          color: #ffffff;
        }

        .co-place-btn {
          width: 100%;
          height: 58px;
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
          letter-spacing: 0.11em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s ease;
        }
        .co-place-btn:hover:not(:disabled) { background: #f0f0ed; }
        .co-place-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .co-place-btn svg {
          transition: transform 0.25s ease;
        }
        .co-place-btn:hover:not(:disabled) svg {
          transform: translateX(4px);
        }

        @keyframes coFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1023px) {
          .co-layout {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .co-summary {
            position: static;
            width: 100%;
          }
        }

        @media (max-width: 767px) {
          .co-page {
            padding-top: 92px;
            padding-bottom: 48px;
          }


          .co-field-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .co-field-grid .co-span-2 {
            grid-column: span 1;
          }
          .co-input { height: 52px; }
          .co-phone-wrap .co-input { height: 52px; }
          .co-phone-prefix { line-height: 52px; }

          .co-section {
            padding: 28px 0 34px;
          }

          .co-payment-option {
            min-height: 62px;
            padding: 0 15px;
          }

          .co-summary {
            border-radius: 14px;
            padding: 24px 20px;
          }
          .co-summary-product {
            grid-template-columns: 64px minmax(0, 1fr) auto;
            gap: 12px;
          }
          .co-summary-prod-img { width: 64px; }
          .co-summary-prod-name { font-size: 13px; }
          .co-summary-total-price { font-size: 36px; }
          .co-place-btn { height: 56px; font-size: 9px; }
        }

        @media (max-width: 359px) {
          .co-place-btn { font-size: 8px; gap: 6px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .co-summary { opacity: 1; transform: none; animation: none; }
        }
      `}</style>

      <div className="mizfit-container">
        {/* LAYOUT */}
        <div className="co-layout">
          {/* FORM */}
          <div className="co-form-wrap">
            <form id="checkout-form" className="co-form" onSubmit={handleSubmit} noValidate>
              {/* SECTION 01 — CONTACT */}
              <div className="co-section">
                <div className="co-section-header">
                  <span className="co-section-num">01</span>
                  <span className="co-section-title">CONTACT</span>
                </div>
                <div className="co-field-grid">
                  <div className="co-span-2">
                    <div className="co-field-group">
                      <label className="co-field-label" htmlFor="customer_name">FULL NAME</label>
                      <input
                        id="customer_name"
                        name="customer_name"
                        type="text"
                        value={form.customer_name}
                        onChange={handleChange}
                        className={`co-input${errors.customer_name ? ' co-invalid' : ''}`}
                        placeholder="e.g. Rajesh Kumar"
                        aria-invalid={!!errors.customer_name}
                        aria-describedby={errors.customer_name ? 'err-customer_name' : undefined}
                      />
                      {errors.customer_name && <p className="co-error-text" id="err-customer_name">{errors.customer_name}</p>}
                    </div>
                  </div>
                  <div>
                    <div className="co-field-group">
                      <label className="co-field-label" htmlFor="customer_email">EMAIL ADDRESS</label>
                      <input
                        id="customer_email"
                        name="customer_email"
                        type="email"
                        value={form.customer_email}
                        onChange={handleChange}
                        className={`co-input${errors.customer_email ? ' co-invalid' : ''}`}
                        placeholder="e.g. rajesh@example.com"
                        aria-invalid={!!errors.customer_email}
                        aria-describedby={errors.customer_email ? 'err-customer_email' : undefined}
                      />
                      {errors.customer_email && <p className="co-error-text" id="err-customer_email">{errors.customer_email}</p>}
                    </div>
                  </div>
                  <div>
                    <div className="co-field-group">
                      <label className="co-field-label" htmlFor="customer_phone">PHONE NUMBER</label>
                      <div className={`co-phone-wrap${errors.customer_phone ? ' co-invalid' : ''}`}>
                        <span className="co-phone-prefix">+91</span>
                        <input
                          id="customer_phone"
                          name="customer_phone"
                          type="tel"
                          inputMode="numeric"
                          value={form.customer_phone}
                          onChange={handleChange}
                          className="co-input"
                          placeholder="e.g. 98765 43210"
                          aria-invalid={!!errors.customer_phone}
                          aria-describedby={errors.customer_phone ? 'err-customer_phone' : undefined}
                        />
                      </div>
                      {errors.customer_phone && <p className="co-error-text" id="err-customer_phone">{errors.customer_phone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 02 — SHIPPING */}
              <div className="co-section">
                <div className="co-section-header">
                  <span className="co-section-num">02</span>
                  <span className="co-section-title">SHIPPING</span>
                </div>
                <div className="co-field-grid">
                  <div className="co-span-2">
                    <div className="co-field-group">
                      <label className="co-field-label" htmlFor="address">STREET ADDRESS</label>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={form.address}
                        onChange={handleChange}
                        className={`co-textarea${errors.address ? ' co-invalid' : ''}`}
                        placeholder="e.g. 42, MG Road, Indiranagar"
                        aria-invalid={!!errors.address}
                        aria-describedby={errors.address ? 'err-address' : undefined}
                      />
                      {errors.address && <p className="co-error-text" id="err-address">{errors.address}</p>}
                    </div>
                  </div>
                  <div>
                    <div className="co-field-group">
                      <label className="co-field-label" htmlFor="city">CITY</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={form.city}
                        onChange={handleChange}
                        className={`co-input${errors.city ? ' co-invalid' : ''}`}
                        placeholder="e.g. Bengaluru"
                        aria-invalid={!!errors.city}
                        aria-describedby={errors.city ? 'err-city' : undefined}
                      />
                      {errors.city && <p className="co-error-text" id="err-city">{errors.city}</p>}
                    </div>
                  </div>
                  <div>
                    <div className="co-field-group">
                      <label className="co-field-label" htmlFor="state">STATE</label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={form.state}
                        onChange={handleChange}
                        className={`co-input${errors.state ? ' co-invalid' : ''}`}
                        placeholder="e.g. Karnataka"
                        aria-invalid={!!errors.state}
                        aria-describedby={errors.state ? 'err-state' : undefined}
                      />
                      {errors.state && <p className="co-error-text" id="err-state">{errors.state}</p>}
                    </div>
                  </div>
                  <div className="co-span-2" style={{ maxWidth: 320 }}>
                    <div className="co-field-group">
                      <label className="co-field-label" htmlFor="postal_code">POSTAL CODE</label>
                      <input
                        id="postal_code"
                        name="postal_code"
                        type="text"
                        inputMode="numeric"
                        value={form.postal_code}
                        onChange={handleChange}
                        className={`co-input${errors.postal_code ? ' co-invalid' : ''}`}
                        placeholder="e.g. 560038"
                        maxLength={6}
                        aria-invalid={!!errors.postal_code}
                        aria-describedby={errors.postal_code ? 'err-postal_code' : undefined}
                      />
                      {errors.postal_code && <p className="co-error-text" id="err-postal_code">{errors.postal_code}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 03 — PAYMENT */}
              <div className="co-section">
                <div className="co-section-header">
                  <span className="co-section-num">03</span>
                  <span className="co-section-title">PAYMENT</span>
                </div>
                <div className="co-payment-options" role="radiogroup" aria-label="Payment method">
                  {paymentMethods.map((pm) => (
                    <label
                      key={pm.value}
                      className={`co-payment-option${form.payment_method === pm.value ? ' co-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={pm.value}
                        checked={form.payment_method === pm.value}
                        onChange={handleChange}
                        className="co-payment-radio"
                      />
                      <div className="co-payment-left">
                        <span className="co-payment-title">{pm.label}</span>
                        <span className="co-payment-desc">{pm.desc}</span>
                      </div>
                      <span className="co-payment-indicator" />
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* ORDER SUMMARY */}
          <div className="co-summary">
            <p className="co-summary-heading">YOUR ORDER</p>
            <p className="co-summary-count">{items.length} ITEMS</p>

            <div className="co-summary-products">
              {items.map((item) => {
                const metaParts: string[] = []
                if (item.color) metaParts.push(item.color.toUpperCase())
                if (item.size) metaParts.push(item.size.toUpperCase())
                if (item.printSide) metaParts.push(item.printSide.toUpperCase())

                return (
                  <div key={item.id} className="co-summary-product">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="co-summary-prod-img"
                      loading="lazy"
                    />
                    <div className="co-summary-prod-info">
                      <p className="co-summary-prod-name">{item.product.name}</p>
                      <p className="co-summary-prod-meta">{metaParts.join(' / ')}</p>
                      <p className="co-summary-prod-qty">QTY {item.quantity}</p>
                      {(item.designPreview || item.designFileName) && (
                        <>
                          <span className="co-summary-prod-custom-badge">CUSTOM</span>
                          {item.designFileName && (
                            <p className="co-summary-prod-artwork">ARTWORK / {item.designFileName}</p>
                          )}
                        </>
                      )}
                    </div>
                    <span className="co-summary-prod-price">
                      {formatPrice(item.itemPrice * item.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="co-summary-subtotal">
              <span className="co-summary-subtotal-label">SUBTOTAL</span>
              <span className="co-summary-subtotal-value">{formatPrice(total)}</span>
            </div>
            <div className="co-summary-shipping">
              <span className="co-summary-shipping-label">SHIPPING</span>
              <span className="co-summary-shipping-value">CALCULATED AFTER ADDRESS</span>
            </div>

            <div className="co-summary-total">
              <span className="co-summary-total-label">TOTAL</span>
              <span className="co-summary-total-price">{formatPrice(total)}</span>
            </div>

            {submitError && (
              <div className="co-submit-error" role="alert">
                WE COULDN&rsquo;T PLACE YOUR ORDER.<br />
                Please check your details and try again.
              </div>
            )}

            <button
              type="submit"
              form="checkout-form"
              className="co-place-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'coSpin 0.8s linear infinite' }}>
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
                    <path d="M7 1a6 6 0 016 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  PLACING ORDER...
                </>
              ) : (
                <>
                  PLACE ORDER — {formatPrice(total)}
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path d="M10 1l5 5m0 0l-5 5m5-5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>

            <style>{`
              @keyframes coSpin {
                to { transform: rotate(360deg); }
              }
              @media (prefers-reduced-motion: reduce) {
                .co-place-btn svg[style*="animation"] { animation: none !important; }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  )
}
