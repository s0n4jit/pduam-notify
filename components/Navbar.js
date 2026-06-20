'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { useState, useRef, useEffect, useCallback } from 'react';
import AnimatedBell from './AnimatedBell';

// Shared button style factory — keeps the two control buttons identical
function ctrlBtnStyle(extra = {}) {
  return {
    // NOTE: display is intentionally NOT set here.
    // Inline styles always beat Tailwind utility classes (including sm:hidden),
    // so display:flex lives in the .ctrl-btn CSS class instead.
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    minWidth: '44px',
    minHeight: '44px',
    borderRadius: '50%',
    border: '1.5px solid var(--border)',
    background: 'transparent',
    cursor: 'pointer',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    position: 'relative',
    zIndex: 10,
    pointerEvents: 'all',
    transition: 'opacity 0.1s ease, transform 0.1s ease',
    ...extra,
  };
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navRef  = useRef(null);
  const menuRef = useRef(null);

  // Close when tapping outside
  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (
        navRef.current  && !navRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onOutside, { passive: true });
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [open]);

  // Close on route change (Link clicks already call closeMenu, this is a safety net)
  useEffect(() => {
    setOpen(false);
  }, []); // only on mount — real route changes handled by onClick on Links

  const handleTheme  = useCallback((e) => { e.preventDefault(); e.stopPropagation(); toggleTheme(); }, [toggleTheme]);
  const handleToggle = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }, []);
  const closeMenu    = useCallback(() => setOpen(false), []);

  const navLinks = [
    { href: '/',               label: 'Home'          },
    { href: '/notices',        label: 'Notices'        },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/about',          label: 'About'          },
  ];

  // Mobile dropdown labels (with emoji prefix)
  const mobileLinks = [
    { href: '/',               label: '🏠  Home'          },
    { href: '/notices',        label: '📋  Notices'        },
    { href: '/privacy-policy', label: '🔒  Privacy Policy' },
    { href: '/about',          label: 'ℹ️  About'          },
  ];

  return (
    <>
      {/* ── Pill navbar ─────────────────────────────────────── */}
      <div
        ref={navRef}
        className="sticky top-4 z-[200] w-[calc(100%-2rem)] max-w-[800px] mx-auto mb-1"
      >
        {/* Inner pill */}
        <div
          className="h-14 sm:h-16 rounded-[1.75rem] px-3 sm:px-6 flex items-center justify-between shadow-xl"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2 flex-shrink-0"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="w-9 h-9 flex-shrink-0">
              <AnimatedBell className="w-9 h-9" />
            </div>
            <span className="font-bold text-[13px] sm:text-[15px] tracking-wide gold-text select-none">
              PDUAM NOTIFY
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden sm:flex items-center gap-5" aria-label="Main navigation">
            {navLinks.map(({ href, label }, i) => (
              <span key={href} className="contents">
                {i > 0 && (
                  <span aria-hidden="true" style={{ color: 'var(--border-hover)', fontSize: '10px', userSelect: 'none', lineHeight: 1 }}>•</span>
                )}
                <Link
                  href={href}
                  className="text-[13px] font-semibold transition-colors hover:text-amber-400"
                  style={{ color: 'var(--text-secondary)', WebkitTapHighlightColor: 'transparent' }}
                >
                  {label}
                </Link>
              </span>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              id="theme-toggle-btn"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onPointerDown={handleTheme}
              className="ctrl-btn"
              style={ctrlBtnStyle({ color: 'var(--text-secondary)', fontSize: '16px' })}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              id="mobile-menu-btn"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-nav-menu"
              onPointerDown={handleToggle}
              className="ctrl-btn sm:hidden"
              style={ctrlBtnStyle({ color: 'var(--text)', fontSize: '18px', fontWeight: '700' })}
            >
              {/*
                Use CSS transform to rotate the icon — no re-render-driven layout shift.
                The span itself never changes size so there is no jitter.
              */}
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  lineHeight: 1,
                  // Rotate ☰ → ✕ with a smooth spin instead of swapping characters
                  transition: 'transform 0.22s ease, opacity 0.15s ease',
                  transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                {open ? '✕' : '☰'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown — sm:hidden ensures it never shows on desktop.
            display:grid is set via CSS class (not inline) so Tailwind can override it. */}
        <div
          id="mobile-nav-menu"
          ref={menuRef}
          role="navigation"
          aria-label="Mobile navigation"
          aria-hidden={!open}
          className="sm:hidden nav-dropdown"
          style={{
            gridTemplateRows: open ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
            // Fade opacity independently for a polished compound feel
            opacity: open ? 1 : 0,
            transition: 'grid-template-rows 0.24s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease',
            marginTop: open ? '6px' : '2px',
            pointerEvents: open ? 'all' : 'none',
          }}
        >
          {/* This inner wrapper MUST have overflow:hidden to clip during collapse */}
          <div style={{ overflow: 'hidden' }}>
            <div
              className="rounded-[1.5rem] p-2 flex flex-col gap-1.5 shadow-2xl"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                // Lighter blur — heavy blur degrades performance on low-end phones
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {mobileLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  style={{
                    display: 'block',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: 'var(--text)',
                    background: 'var(--input-bg)',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    // Subtle tap feedback without JS
                    transition: 'opacity 0.1s ease',
                  }}
                >
                  {label}
                </Link>
              ))}

              <Link
                href="https://t.me/pduam_amjonga_notices"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#0ea5e9',
                  background: 'rgba(14,165,233,0.1)',
                  border: '1px solid rgba(14,165,233,0.2)',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a5.8 5.8 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Join Our Telegram Channel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
