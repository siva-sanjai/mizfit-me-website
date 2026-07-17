import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setCheckingSession(false);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'alSpinner 0.6s linear infinite' }} />
        <style>{`@keyframes alSpinner { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const animLeft = (delay: number) =>
    mounted
      ? { opacity: 1, transform: 'translateY(0)', transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }
      : { opacity: 0, transform: 'translateY(20px)' };

  const animRight = (delay: number) =>
    mounted
      ? { opacity: 1, transform: 'translateY(0)', transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }
      : { opacity: 0, transform: 'translateY(16px)' };

  return (
    <div className="al-root">
      <style>{`
        .al-root {
          min-height: 100dvh;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(480px, 0.95fr);
          background: #f5f5f3;
          overflow: hidden;
        }
        .al-root * { box-sizing: border-box; }

        /* Left brand panel */
        .al-brand {
          background: #0a0a0a;
          color: #ffffff;
          position: relative;
          overflow: hidden;
          padding: clamp(48px, 5vw, 84px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }
        .al-brand-logo { font-size: 30px; font-weight: 800; letter-spacing: -0.06em; color: #ffffff; }
        .al-brand-sub { margin-top: 7px; font-size: 8px; font-weight: 650; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.38); }

        .al-brand-bg {
          position: absolute;
          right: -8%;
          top: 28%;
          font-size: clamp(220px, 25vw, 520px);
          font-weight: 800;
          line-height: 0.7;
          letter-spacing: -0.08em;
          color: rgba(255,255,255,0.025);
          pointer-events: none;
          user-select: none;
          transform: rotate(-90deg);
        }

        .al-brand-message { position: relative; z-index: 2; }
        .al-brand-claim {
          font-size: clamp(66px, 6vw, 110px);
          font-weight: 800;
          line-height: 0.78;
          letter-spacing: -0.07em;
          text-transform: uppercase;
          color: #ffffff;
        }
        .al-brand-tag {
          margin-top: 30px;
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }

        /* Right login panel */
        .al-panel {
          background: #f5f5f3;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(32px, 6vw, 100px);
          min-width: 0;
        }
        .al-content {
          width: 100%;
          max-width: 460px;
        }

        .al-label { font-size: 8px; font-weight: 650; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(0,0,0,0.4); }
        .al-heading {
          margin-top: 22px;
          font-size: clamp(58px, 5.5vw, 86px);
          font-weight: 800;
          line-height: 0.78;
          letter-spacing: -0.065em;
          text-transform: uppercase;
          color: #111111;
        }
        .al-desc { margin-top: 28px; font-size: 13px; line-height: 1.6; color: rgba(0,0,0,0.48); }

        .al-form { margin-top: 48px; display: flex; flex-direction: column; gap: 24px; }
        .al-field { display: flex; flex-direction: column; gap: 9px; }
        .al-field-label {
          font-size: 8px;
          font-weight: 650;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.52);
        }
        .al-input-wrap { position: relative; }
        .al-input {
          width: 100%;
          height: 54px;
          padding: 0 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0,0,0,0.22);
          border-radius: 0;
          font-size: 14px;
          font-weight: 450;
          color: #111111;
          outline: none;
          transition: border-color 0.25s ease;
          box-sizing: border-box;
        }
        .al-input:focus { border-bottom-color: #111111; }
        .al-input::placeholder { color: rgba(0,0,0,0.3); }
        .al-input-pwd { padding-right: 48px; }

        .al-pwd-toggle {
          position: absolute;
          right: 8px;
          bottom: 10px;
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(0,0,0,0.42);
          transition: color 0.2s ease;
        }
        .al-pwd-toggle:hover { color: #111111; }

        .al-error {
          padding: 12px 14px;
          background: #fdecec;
          border: 1px solid rgba(166,59,59,0.18);
          border-radius: 7px;
          font-size: 11px;
          line-height: 1.5;
          color: #a63b3b;
        }

        .al-submit {
          width: 100%;
          height: 54px;
          margin-top: 16px;
          background: #111111;
          color: #ffffff;
          border: 1px solid #111111;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition: background 0.3s ease, color 0.3s ease;
        }
        .al-submit:hover:not(:disabled) { background: transparent; color: #111111; }
        .al-submit:hover:not(:disabled) svg { stroke: #111111; }
        .al-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .al-submit svg { transition: stroke 0.3s ease; }

        .al-security {
          margin-top: 22px;
          font-size: 7px;
          font-weight: 650;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-align: center;
          color: rgba(0,0,0,0.3);
        }

        .al-mobile-brand { display: none; }

        /* Tablet */
        @media (max-width: 1024px) {
          .al-root { grid-template-columns: minmax(0, 0.8fr) minmax(420px, 1.2fr); }
          .al-brand { padding: 40px; }
          .al-brand-claim { font-size: clamp(54px, 7vw, 76px); }
          .al-panel { padding: 48px; }
        }

        /* Mobile */
        @media (max-width: 767px) {
          .al-root { display: block; min-height: 100dvh; }
          .al-brand { display: none; }

          .al-mobile-brand {
            display: block;
            padding: 28px 20px 0;
          }
          .al-mobile-logo { font-size: 23px; font-weight: 800; letter-spacing: -0.055em; color: #111111; }
          .al-mobile-sub { margin-top: 5px; font-size: 7px; font-weight: 650; letter-spacing: 0.2em; color: rgba(0,0,0,0.35); text-transform: uppercase; }

          .al-panel {
            min-height: calc(100dvh - 80px);
            display: flex;
            align-items: center;
            padding: 36px 20px 60px;
          }
          .al-content { max-width: 100%; }

          .al-heading {
            font-size: clamp(52px, 17vw, 76px);
            line-height: 0.8;
            letter-spacing: -0.065em;
          }
          .al-form { margin-top: 40px; gap: 22px; }
          .al-input { height: 52px; font-size: 16px; }
          .al-submit { height: 54px; }
        }

        @media (max-width: 320px) {
          .al-panel { padding-left: 16px; padding-right: 16px; }
        }

        @media (max-height: 700px) and (max-width: 767px) {
          .al-panel { align-items: flex-start; padding-top: 44px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .al-root * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Left brand panel */}
      <div className="al-brand" style={animLeft(0)}>
        <div>
          <p className="al-brand-logo">MIZFIT</p>
          <p className="al-brand-sub">ADMIN PORTAL</p>
        </div>
        <div className="al-brand-bg">MIZFIT</div>
        <div className="al-brand-message">
          <p className="al-brand-claim">
            MANAGE.<br />
            PRINT.<br />
            DELIVER.
          </p>
          <p className="al-brand-tag">MIZFIT STORE MANAGEMENT</p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="al-panel">
        <div className="al-content" style={animRight(100)}>
          {/* Mobile brand header */}
          <div className="al-mobile-brand">
            <p className="al-mobile-logo">MIZFIT</p>
            <p className="al-mobile-sub">ADMIN PORTAL</p>
          </div>

          <p className="al-label">MIZFIT / ADMIN</p>
          <h1 className="al-heading">
            WELCOME<br />
            BACK.
          </h1>
          <p className="al-desc">Sign in to manage your MIZFIT store.</p>

          <form onSubmit={handleSubmit} className="al-form">
            <div className="al-field">
              <label className="al-field-label" htmlFor="al-email">EMAIL ADDRESS</label>
              <input
                id="al-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@mizfit.com"
                className="al-input"
                autoComplete="email"
              />
            </div>

            <div className="al-field">
              <label className="al-field-label" htmlFor="al-password">PASSWORD</label>
              <div className="al-input-wrap">
                <input
                  id="al-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="al-input al-input-pwd"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="al-pwd-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="al-error">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="al-submit">
              <span>{loading ? 'SIGNING IN...' : 'SIGN IN'}</span>
              {loading ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'alSpin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </form>

          <p className="al-security">AUTHORIZED ACCESS ONLY</p>
        </div>
      </div>

      <style>{`
        @keyframes alSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
