'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

let toastId = 0;

// Global toast state — shared across all components
let listeners = [];
let toasts = [];

function emitChange() {
  listeners.forEach((l) => l([...toasts]));
}

export function toast(message, type = 'info', duration = 4000) {
  const id = ++toastId;
  toasts.push({ id, message, type, duration });
  emitChange();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  }, duration);
}

export function Toast() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);

  if (items.length === 0) return null;

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠',
  };

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
  };

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`toast-enter pointer-events-auto p-3 rounded-lg border backdrop-blur-sm text-sm font-medium flex items-center gap-2 ${colors[t.type] || colors.info}`}
        >
          <span className="text-base">{icons[t.type] || icons.info}</span>
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}
