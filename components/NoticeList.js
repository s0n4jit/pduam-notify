'use client';

import { useState, useMemo } from 'react';

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function NoticeCard({ notice, index }) {
  const isPdf = notice.url?.endsWith('.pdf');
  const delay = Math.min(index * 40, 400);

  return (
    <a
      href={notice.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-md"
      style={{
        animationDelay: `${delay}ms`,
        background: notice.isNew ? 'rgba(245, 158, 11, 0.04)' : 'var(--bg-card)',
        borderColor: notice.isNew ? 'rgba(245, 158, 11, 0.2)' : 'var(--border)',
      }}
    >
      {/* Badge */}
      <div className="shrink-0 pt-0.5">
        {notice.isNew ? (
          <span className="text-[10px] font-bold tracking-wide bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-2 py-0.5 rounded-full uppercase">
            New
          </span>
        ) : (
          <span className="text-[10px] font-mono font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
            {isPdf ? 'PDF' : 'DOC'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-snug mb-1 font-medium"
          style={{
            color: notice.isNew ? 'var(--text)' : 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {notice.title}
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {notice.date}
        </p>
      </div>

      {/* Arrow */}
      <span
        className="shrink-0 text-lg leading-none mt-0.5 group-hover:translate-x-0.5 transition-transform"
        style={{ color: 'var(--text-muted)' }}
      >
        ↗
      </span>
    </a>
  );
}

export default function NoticeList({ notices = [], showSearch = true, limit = 0 }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = notices;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) => n.title?.toLowerCase().includes(q) || n.date?.includes(q)
      );
    }
    if (limit > 0) list = list.slice(0, limit);
    return list;
  }, [notices, search, limit]);

  return (
    <div>
      {/* Search */}
      {showSearch && (
        <div className="relative mb-4">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-50" style={{ color: 'var(--text)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices by title or date..."
            className="input-field w-full"
            style={{ paddingLeft: '2.75rem', paddingRight: '2.5rem' }}
            id="notice-search"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : `${filtered.length} Notices`}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to open ↗</p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">{search ? `No notices found for "${search}"` : 'No notices available yet.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n, i) => (
            <NoticeCard key={n.url || i} notice={n} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
