import React from 'react';

/**
 * EmptyState
 * Reusable loading spinner / empty data placeholder.
 *
 * Props:
 *   loading     — show spinner instead of icon (default false)
 *   icon        — JSX icon element for empty state
 *   title       — heading text
 *   description — supporting body text
 *   action      — optional JSX button/link
 */
const EmptyState = ({ loading = false, icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center w-full animate-fade-in">
    {loading ? (
      /* ── Spinner ── */
      <div className="relative mb-8 w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />
        <div className="absolute inset-2 rounded-full bg-indigo-500/10 animate-pulse" />
      </div>
    ) : (
      /* ── Icon box ── */
      <div className="w-20 h-20 glass-card rounded-3xl flex items-center justify-center mb-6 text-slate-600">
        {icon}
      </div>
    )}

    <h3 className="text-xl font-black text-white tracking-tight mb-2">{title}</h3>

    {description && (
      <p className="text-slate-500 font-medium max-w-sm leading-relaxed mb-6 text-sm">
        {description}
      </p>
    )}

    {action && <div>{action}</div>}
  </div>
);

export default EmptyState;
