'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | exists | invalid | error | rate_limited
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [agreeError, setAgreeError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (honeypot) return;

    // Must accept ToS before submitting
    if (!agreed) {
      setAgreeError(true);
      setTimeout(() => setAgreeError(false), 2500);
      return;
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('invalid');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setStatus('rate_limited');
        setMessage('Too many attempts. Please try again later.');
      } else if (data.status === 'verification_sent') {
        setStatus('success');
        setMessage('');
        setEmail('');
        setShowModal(true);
      } else if (data.status === 'already_subscribed') {
        setStatus('exists');
        setMessage('This email is already subscribed.');
      } else if (data.error) {
        setStatus('error');
        setMessage(data.error);
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection.');
    }

    if (status !== 'success') {
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 5000);
    }
  };

  const statusStyles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    exists: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    invalid: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    rate_limited: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <>
    <div className="glass p-5 sm:p-8 rounded-[1.75rem] shadow-xl" id="subscribe-form">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5 text-center sm:text-left">
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 flex shrink-0 items-center justify-center text-2xl rounded-[1rem] shadow-sm"
          style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563eb' }}
        >
          📬
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Get Instant Email Alerts
          </h2>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            We&apos;ll automatically email you the exact moment a new notice is posted. Free, instant, and strictly no spam.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot — uses sr-only so it's hidden without positioning off-screen (which causes mobile scroll issues) */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input-field w-full sm:flex-1"
            required
            id="subscribe-email"
            aria-label="Email address"
            autoComplete="email"
            inputMode="email"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="btn-primary text-[14px] w-full sm:w-auto shrink-0"
            id="subscribe-submit"
            aria-label="Subscribe to notices"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }}
                />
                Subscribing...
              </span>
            ) : status === 'success' ? (
              '✓ Sent!'
            ) : (
              'Subscribe'
            )}
          </button>
        </div>

        {/* ToS + Privacy Policy consent checkbox */}
        <label
          htmlFor="agree-tos"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginTop: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {/* Custom checkbox */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: '20px',
              height: '20px',
              marginTop: '1px',
              borderRadius: '6px',
              border: agreeError
                ? '2px solid rgba(239,68,68,0.8)'
                : agreed
                ? '2px solid #2563eb'
                : '2px solid var(--border)',
              background: agreed ? '#2563eb' : 'var(--input-bg)',
              transition: 'border-color 0.15s ease, background 0.15s ease',
              boxShadow: agreeError ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
            }}
          >
            <input
              id="agree-tos"
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setAgreeError(false); }}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              aria-label="I agree to the Terms of Service and Privacy Policy"
            />
            {agreed && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <polyline
                  points="2,6 5,9 10,3"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>

          <span
            style={{
              fontSize: '12px',
              lineHeight: '1.5',
              color: agreeError ? 'rgba(239,68,68,0.9)' : 'var(--text-muted)',
              transition: 'color 0.15s ease',
            }}
          >
            I agree to the{' '}
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: 'var(--brand)', textDecoration: 'underline', fontWeight: 600 }}
            >
              Terms of Service
            </a>
            {' '}and{' '}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: 'var(--brand)', textDecoration: 'underline', fontWeight: 600 }}
            >
              Privacy Policy
            </a>
            {agreeError && <span style={{ display: 'block', color: 'rgba(239,68,68,0.9)', fontWeight: 600, marginTop: '2px' }}>Please accept to continue.</span>}
          </span>
        </label>

        {/* Inline status message */}
        {message && status !== 'success' && (
          <div className={`mt-3 p-3 rounded-lg border text-xs font-medium ${statusStyles[status] || ''}`} role="alert">
            {message}
          </div>
        )}
      </form>

      <p className="text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
        We&apos;ll send a verification email first. Unsubscribe anytime.{' '}
        <a href="/privacy-policy" className="underline hover:opacity-80">Privacy Policy</a>
      </p>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>

    {/* ── Verify-email modal ── rendered via portal to escape the glass
        container's backdrop-filter stacking context, which breaks
        position:fixed for children on all browsers. */}
    {showModal && typeof document !== 'undefined' && createPortal(
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0 1rem 1.5rem',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Subscription confirmation"
        onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setStatus('idle'); } }}
      >
        {/* Center on tablet+ */}
        <style>{`
          @media (min-width: 640px) {
            #verify-modal-card-wrap { align-items: center !important; padding-bottom: 0 !important; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '1.25rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            maxWidth: '360px',
            width: '100%',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            animation: 'fadeUp 0.28s cubic-bezier(0,0,0.21,1) both',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 1rem',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          >📬</div>

          <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Verify Your Email
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Almost done! We sent a verification link to confirm your email.
            Please check your inbox and verify using the link.
          </p>

          <div
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '0.625rem',
              padding: '0.625rem 0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              textAlign: 'left',
            }}
          >
            <span style={{ flexShrink: 0, marginTop: '1px' }}>⚠️</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 500, margin: 0 }}>
              Can&apos;t find it? Check your{' '}
              <strong style={{ color: '#f59e0b' }}>Spam or Junk</strong> folder!
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setShowModal(false); setStatus('idle'); }}
            className="btn-primary w-full"
            autoFocus
          >
            Got it, thanks!
          </button>
        </div>
      </div>,
      document.body
    )}
  </>
  );
}
