import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { validateEmail, sanitizeInput } from '@/utils/helpers'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const initialForm: FormData = { name: '', email: '', subject: '', message: '' }

const contactInfo = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
      </svg>
    ),
    label: 'EMAIL',
    value: 'hello@mizfit.com',
    href: 'mailto:hello@mizfit.com',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    label: 'PHONE',
    value: '+91 98765 43210',
    href: 'tel:+919876543210',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: 'ADDRESS',
    value: 'Andheri East, Mumbai, Maharashtra 400093',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    label: 'BULK ENQUIRIES',
    value: 'bulk@mizfit.com',
    href: 'mailto:bulk@mizfit.com',
  },
]

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState<FormData>(() => {
    if (searchParams.get('type') === 'bulk') {
      return { ...initialForm, subject: 'Bulk Order Enquiry' }
    }
    return initialForm
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const pageRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'message' ? value : sanitizeInput(value) }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = 'Enter your name.'
    if (!form.email.trim()) errs.email = 'Enter your email address.'
    else if (!validateEmail(form.email)) errs.email = 'Enter a valid email address.'
    if (!form.subject.trim()) errs.subject = 'Enter a subject.'
    if (!form.message.trim()) errs.message = 'Tell us a little about your enquiry.'
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    setSubmitting(false)
    setSubmitted(true)
    setForm(initialForm)
  }

  const anim = (delay: number) =>
    loaded
      ? { opacity: 1, transform: 'translateY(0)', transition: `opacity 0.7s ease, transform 0.7s ease ${delay}ms` }
      : { opacity: 0, transform: 'translateY(24px)' }

  return (
    <div ref={pageRef} className="cp-page">
      <style>{`
        .cp-page {
          width: 100%;
          background: #f6f6f3;
          color: #111111;
          padding-top: 140px;
          padding-bottom: 0;
        }

        .cp-main {
          border-top: 1px solid rgba(0,0,0,0.16);
          padding: 72px 0 100px;
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.65fr);
          gap: clamp(70px, 9vw, 150px);
          align-items: start;
        }

        .cp-form-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.42);
        }
        .cp-form-heading {
          margin-top: 18px;
          font-size: clamp(34px, 4vw, 58px);
          font-weight: 700;
          line-height: 0.9;
          letter-spacing: -0.05em;
          color: #111111;
          margin-bottom: 42px;
        }

        .cp-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 26px 18px;
        }
        .cp-span-2 { grid-column: span 2; }

        .cp-field {}
        .cp-field-label {
          display: block;
          margin-bottom: 10px;
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.48);
        }
        .cp-input {
          width: 100%;
          height: 56px;
          padding: 0 0;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0,0,0,0.22);
          border-radius: 0;
          font-family: inherit;
          font-size: 14px;
          color: #111111;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.25s ease;
        }
        .cp-input:focus { border-bottom-color: #111111; }
        .cp-input::placeholder { color: rgba(0,0,0,0.28); }
        .cp-input.cp-invalid { border-bottom-color: rgba(159,47,47,0.7); }

        .cp-textarea {
          width: 100%;
          min-height: 160px;
          padding: 16px 0;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0,0,0,0.22);
          border-radius: 0;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
          color: #111111;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
          transition: border-color 0.25s ease;
        }
        .cp-textarea:focus { border-bottom-color: #111111; }
        .cp-textarea::placeholder { color: rgba(0,0,0,0.28); }
        .cp-textarea.cp-invalid { border-bottom-color: rgba(159,47,47,0.7); }

        .cp-error-text {
          margin-top: 7px;
          font-size: 10px;
          color: #9f2f2f;
        }

        .cp-submit-area {
          grid-column: span 2;
        }
        .cp-submit-btn {
          margin-top: 18px;
          width: fit-content;
          min-width: 210px;
          height: 58px;
          padding: 0 28px;
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s ease;
        }
        .cp-submit-btn:hover:not(:disabled) { background: #282828; }
        .cp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cp-submit-btn svg {
          transition: transform 0.3s ease;
        }
        .cp-submit-btn:hover:not(:disabled) svg {
          transform: translate(4px, -4px);
        }

        .cp-success {
          margin-top: 20px;
          padding: 16px 0;
          border-top: 1px solid rgba(0,0,0,0.16);
        }
        .cp-success-heading {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: rgba(0,0,0,0.7);
        }
        .cp-success-desc {
          margin-top: 6px;
          font-size: 11px;
          line-height: 1.6;
          color: rgba(0,0,0,0.55);
        }

        .cp-info-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.42);
        }
        .cp-info-heading {
          margin-top: 18px;
          font-size: clamp(30px, 3vw, 46px);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: -0.045em;
          color: #111111;
          margin-bottom: 38px;
        }

        .cp-info-rows {}
        .cp-info-row {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
          padding: 22px 0;
          border-top: 1px solid rgba(0,0,0,0.14);
        }
        .cp-info-row:last-child {
          border-bottom: 1px solid rgba(0,0,0,0.14);
        }
        .cp-info-icon {
          color: #111111;
          display: flex;
          align-items: flex-start;
          padding-top: 1px;
        }
        .cp-info-icon-label {
          font-size: 8px;
          font-weight: 650;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }
        .cp-info-icon-value {
          margin-top: 7px;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 500;
          color: #111111;
        }
        .cp-info-icon-value a {
          color: inherit;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .cp-info-icon-value a:hover { opacity: 0.55; }

        .cp-social {
          margin-top: 38px;
        }
        .cp-social-label {
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.2em;
          color: rgba(0,0,0,0.42);
        }
        .cp-social-links {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 24px;
          margin-top: 16px;
        }
        .cp-social-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 650;
          letter-spacing: 0.12em;
          color: #111111;
          text-decoration: none;
          transition: opacity 0.25s ease;
        }
        .cp-social-link:hover { opacity: 0.55; }

        @media (max-width: 1023px) {
          .cp-main {
            grid-template-columns: 1fr;
            gap: 72px;
          }
        }

        @media (max-width: 767px) {
          .cp-page { padding-top: 96px; }
          .cp-main { padding: 52px 0 72px; gap: 56px; }

          .cp-form-grid { grid-template-columns: 1fr; gap: 22px; }
          .cp-span-2 { grid-column: span 1; }
          .cp-submit-area { grid-column: span 1; }
          .cp-submit-btn { width: 100%; height: 56px; }

          .cp-info-heading { font-size: clamp(32px, 10vw, 44px); }
          .cp-info-row {
            grid-template-columns: 32px minmax(0, 1fr);
            gap: 14px;
            padding: 20px 0;
          }
          .cp-info-icon-value { overflow-wrap: anywhere; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cp-page * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="mizfit-container">
        {/* MAIN CONTENT */}
        <div className="cp-main">
          {/* LEFT — FORM */}
          <div style={anim(180)}>
            <p className="cp-form-label">01 / SEND A MESSAGE</p>
            <h2 className="cp-form-heading">
              TELL US<br />WHAT&rsquo;S UP.
            </h2>

            {submitted ? (
              <div className="cp-success">
                <p className="cp-success-heading">MESSAGE SENT.</p>
                <p className="cp-success-desc">We&rsquo;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="cp-form-grid">
                  <div className="cp-field">
                    <label className="cp-field-label" htmlFor="name">YOUR NAME</label>
                    <input
                      id="name" name="name" type="text" value={form.name} onChange={handleChange}
                      className={`cp-input${errors.name ? ' cp-invalid' : ''}`}
                      placeholder="Your name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'err-name' : undefined}
                    />
                    {errors.name && <p className="cp-error-text" id="err-name">{errors.name}</p>}
                  </div>
                  <div className="cp-field">
                    <label className="cp-field-label" htmlFor="email">EMAIL ADDRESS</label>
                    <input
                      id="email" name="email" type="email" value={form.email} onChange={handleChange}
                      className={`cp-input${errors.email ? ' cp-invalid' : ''}`}
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'err-email' : undefined}
                    />
                    {errors.email && <p className="cp-error-text" id="err-email">{errors.email}</p>}
                  </div>
                  <div className="cp-span-2">
                    <div className="cp-field">
                      <label className="cp-field-label" htmlFor="subject">SUBJECT</label>
                      <input
                        id="subject" name="subject" type="text" value={form.subject} onChange={handleChange}
                        className={`cp-input${errors.subject ? ' cp-invalid' : ''}`}
                        placeholder="Custom print, bulk order, or something else"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'err-subject' : undefined}
                      />
                      {errors.subject && <p className="cp-error-text" id="err-subject">{errors.subject}</p>}
                    </div>
                  </div>
                  <div className="cp-span-2">
                    <div className="cp-field">
                      <label className="cp-field-label" htmlFor="message">YOUR MESSAGE</label>
                      <textarea
                        id="message" name="message" rows={5} value={form.message} onChange={handleChange}
                        className={`cp-textarea${errors.message ? ' cp-invalid' : ''}`}
                        placeholder="Tell us what you have in mind..."
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'err-message' : undefined}
                      />
                      {errors.message && <p className="cp-error-text" id="err-message">{errors.message}</p>}
                    </div>
                  </div>
                  <div className="cp-submit-area">
                    <button type="submit" className="cp-submit-btn" disabled={submitting}>
                      {submitting ? 'SENDING...' : 'SEND MESSAGE'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17l10-10M7 7h10v10" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT — INFO */}
          <div style={anim(260)}>
            <p className="cp-info-label">02 / FIND US</p>
            <h2 className="cp-info-heading">
              OTHER WAYS<br />TO SAY HELLO.
            </h2>

            <div className="cp-info-rows">
              {contactInfo.map((item) => (
                <div key={item.label} className="cp-info-row">
                  <div className="cp-info-icon">{item.icon}</div>
                  <div>
                    <p className="cp-info-icon-label">{item.label}</p>
                    <p className="cp-info-icon-value">
                      {item.href ? (
                        <a href={item.href}>{item.value}</a>
                      ) : (
                        item.value
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="cp-social">
              <p className="cp-social-label">FOLLOW MIZFIT</p>
              <div className="cp-social-links">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-social-link"
                >
                  INSTAGRAM
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17l10-10M7 7h10v10" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
