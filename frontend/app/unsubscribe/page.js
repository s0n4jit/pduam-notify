'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (data.status === 'unsubscribed') {
        setStatus('success');
        setMessage('You have been unsubscribed successfully.');
      } else if (data.status === 'not_found') {
        setStatus('not_found');
        setMessage('That email is not in our subscriber list.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 relative mt-4">
      {/* Decorative background blobs for glass effect to shine */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-red-500/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/2 left-1/2 translate-x-1/4 translate-y-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none -z-10"></div>

      <div className="glass p-8 sm:p-10 w-full max-w-md text-center rounded-[2rem] shadow-2xl transition-all duration-300">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">
          📭
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Unsubscribe</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          We're sad to see you go. Enter your email to stop receiving notices from PDUAM NOTIFY.
        </p>

        {status === 'success' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-emerald-600 dark:text-emerald-400 text-sm shadow-sm" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <span className="block text-2xl mb-2">✅</span>
            <strong className="block mb-1 text-[15px]">Success</strong>
            {message}
            <div className="mt-5 pt-4 border-t border-emerald-500/20">
              <Link href="/" className="inline-flex items-center gap-1 font-semibold transition-colors hover:text-emerald-500">
                ← Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="w-full bg-[var(--input-bg)] border-2 border-[var(--border)] text-[var(--text)] rounded-2xl px-5 py-3.5 text-[15px] outline-none transition-all duration-200 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)] placeholder:text-[var(--text-muted)] mb-4"
              required
              id="unsubscribe-email"
            />

            {status === 'not_found' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-600 dark:text-amber-400 text-[13px] mb-4 text-left flex items-start gap-2">
                <span>⚠️</span> <span>{message}</span>
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-600 dark:text-red-400 text-[13px] mb-4 text-left flex items-start gap-2">
                <span>❌</span> <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!email || status === 'loading'}
              className="w-full py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: status === 'loading' ? 'var(--input-bg)' : 'rgba(239, 68, 68, 0.1)',
                borderColor: status === 'loading' ? 'var(--border)' : 'rgba(239, 68, 68, 0.2)',
                borderWidth: '1px',
                color: status === 'loading' ? 'var(--text-muted)' : '#ef4444',
                backdropFilter: 'blur(4px)'
              }}
              id="unsubscribe-submit"
            >
              {status === 'loading' ? (
                <>
                  <span className="animate-spin">⏳</span> Processing...
                </>
              ) : (
                <>
                  Confirm Unsubscribe <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>

            <Link href="/" className="inline-block mt-6 text-sm font-medium transition-colors hover:text-[var(--text)]" style={{ color: 'var(--text-muted)' }}>
              Wait, I changed my mind
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
