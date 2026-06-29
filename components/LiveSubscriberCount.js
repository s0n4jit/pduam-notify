'use client';

import { useEffect, useState } from 'react';

/**
 * LiveSubscriberCount
 *
 * Fetches the verified subscriber count from /api/subscriber-count
 * and animates the number counting up from 0 for a polished feel.
 * Shows "—" while loading or on error so the stat card never looks broken.
 */
export default function LiveSubscriberCount() {
  const [count, setCount]       = useState(null); // null = loading
  const [display, setDisplay]   = useState('—');

  useEffect(() => {
    const fetchCount = () => {
      fetch('/api/subscriber-count')
        .then((r) => r.json())
        .then(({ count: c }) => {
          if (c === null || c === undefined) { setDisplay('—'); return; }
          setCount(c);
        })
        .catch(() => setDisplay('—'));
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  // Animate count-up when value arrives
  useEffect(() => {
    if (count === null) return;
    if (count === 0) { setDisplay('0'); return; }

    let start = 0;
    const duration = 600; // ms
    const step = Math.ceil(count / (duration / 16)); // ~60fps
    const timer = setInterval(() => {
      start = Math.min(start + step, count);
      setDisplay(start.toString());
      if (start >= count) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [count]);

  return <>{display}</>;
}
