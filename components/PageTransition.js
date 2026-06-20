'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * PageTransition
 *
 * IMPORTANT: The wrapper must be a real rendered block element — NOT display:contents.
 * display:contents removes the box from the paint tree, killing any CSS animation on it.
 * We use a plain div that fills the parent flex container (flex:1 → flex-1 on <main>).
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();

  // Scroll to top instantly on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div
      key={pathname}
      className="page-transition-enter"
      style={{
        // Fill the parent <main className="flex-1"> completely
        flex: 1,
        minHeight: 0,
        // Pre-promote to GPU layer so the first frame doesn't stutter
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
