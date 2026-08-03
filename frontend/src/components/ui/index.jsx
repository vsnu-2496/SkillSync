/**
 * src/components/ui/index.jsx
 * ─────────────────────────────────────────────────────────────────────
 * UPGRADED: Added new components for Career Readiness Platform.
 * All existing components preserved — no breaking changes.
 *
 * NEW:
 *  - CircularProgress  — animated SVG ring for career readiness score
 *  - SkillChip         — color-coded chip for matched/missing skills
 *  - ExpandableCard    — collapsible card for sub-score categories
 *  - Skeleton          — loading placeholder animation
 *  - ScoreBar          — labeled progress bar with score/total display
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ─── EXISTING COMPONENTS (Unchanged) ──────────────────────────────────

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  fullWidth = false,
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    borderRadius: '14px',
    fontWeight: 700,
    cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    width: fullWidth ? '100%' : 'fit-content',
    textDecoration: 'none',
    fontSize: size === 'sm' ? '0.8rem' : '0.9rem',
    height: size === 'sm' ? '40px' : '52px',
    padding: '0 1.5rem',
    opacity: (disabled || loading) ? 0.6 : 1,
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      color: 'white',
      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
    },
    ghost: {
      background: 'rgba(255, 255, 255, 0.03)',
      color: 'var(--text-muted)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'rgba(244, 63, 94, 0.05)',
      color: '#f43f5e',
      border: '1px solid rgba(244, 63, 94, 0.1)',
    }
  };

  const activeVariant = variants[variant] || variants.primary;

  return (
    <motion.button
      whileHover={(!disabled && !loading) ? { scale: 1.02, boxShadow: variant === 'primary' ? '0 0 25px rgba(99, 102, 241, 0.3)' : 'none' } : {}}
      whileTap={(!disabled && !loading) ? { scale: 0.98 } : {}}
      onClick={!disabled && !loading ? onClick : undefined}
      style={{ ...baseStyles, ...activeVariant }}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? (
        <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      ) : Icon && <Icon size={size === 'sm' ? 16 : 20} />}
      <span>{loading ? 'Processing...' : children}</span>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
    </motion.button>
  );
};

export const GlassCard = ({ children, className = '', hover = true, style = {}, ...props }) => (
  <div
    className={`glass-card ${hover ? 'hover-glow' : ''} ${className}`}
    style={{ padding: '2rem', ...style }}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({ children, variant = 'primary', icon: Icon }) => {
  const styles = {
    primary: { background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' },
    success: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
    warning: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' },
    danger: { background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)' },
    ghost: { background: 'rgba(255,255,255,0.03)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }
  };
  return (
    <span className="badge" style={styles[variant] || styles.primary}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export const ProgressBar = ({ progress, height = 6, color = 'linear-gradient(90deg, #6366f1, #a855f7)' }) => (
  <div style={{ height, background: 'rgba(255,255,255,0.03)', borderRadius: '99px', overflow: 'hidden' }}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 1 }}
      style={{ height: '100%', background: color, borderRadius: '99px' }}
    />
  </div>
);

export const Input = ({ label, icon: Icon, error, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {label && <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {Icon && <Icon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />}
      <input
        style={{
          width: '100%',
          height: '52px',
          padding: `0 1.25rem 0 ${Icon ? '3.25rem' : '1.25rem'}`,
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: error ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'all 0.2s'
        }}
        {...props}
      />
    </div>
    {error && <p style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 600, paddingLeft: '4px' }}>{error}</p>}
  </div>
);

// ─── NEW COMPONENTS ────────────────────────────────────────────────────

/**
 * CircularProgress — Animated SVG ring showing a score percentage.
 * Used for the Career Readiness main score display.
 */
export const CircularProgress = ({
  score = 0,
  size = 160,
  strokeWidth = 10,
  color = '#6366f1',
  label = '',
  sublabel = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        {/* Background track */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      {/* Center label */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <p style={{ fontSize: size > 120 ? '2rem' : '1.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{score}%</p>
          {label && <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</p>}
          {sublabel && <p style={{ fontSize: '0.65rem', fontWeight: 700, color, marginTop: '2px' }}>{sublabel}</p>}
        </motion.div>
      </div>
    </div>
  );
};

/**
 * SkillChip — Color-coded chip for matched or missing skills.
 */
export const SkillChip = ({ skill, type = 'matched' }) => {
  const styles = {
    matched: {
      background: 'rgba(16, 185, 129, 0.08)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.2)',
    },
    missing: {
      background: 'rgba(244, 63, 94, 0.08)',
      color: '#f43f5e',
      border: '1px solid rgba(244, 63, 94, 0.2)',
    },
    neutral: {
      background: 'rgba(99, 102, 241, 0.06)',
      color: '#818cf8',
      border: '1px solid rgba(99, 102, 241, 0.15)',
    }
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '0.3rem 0.75rem',
        borderRadius: '99px',
        fontSize: '0.75rem',
        fontWeight: 700,
        ...(styles[type] || styles.neutral)
      }}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
      {skill}
    </motion.span>
  );
};

/**
 * ExpandableCard — Collapsible card for each career readiness category.
 * Shows score, progress bar, and expandable explanation + tips.
 */
export const ExpandableCard = ({
  title,
  icon: Icon,
  score,
  maxScore = 25,
  color = '#6366f1',
  explanation = '',
  improvement = ''
}) => {
  const [open, setOpen] = useState(false);
  const pct = Math.round((score / maxScore) * 100);

  const tierLabel = pct >= 84 ? 'Excellent' : pct >= 64 ? 'Good' : pct >= 44 ? 'Average' : 'Needs Work';
  const tierColor = pct >= 84 ? '#10b981' : pct >= 64 ? '#6366f1' : pct >= 44 ? '#f59e0b' : '#f43f5e';

  return (
    <motion.div
      layout
      style={{
        background: 'rgba(15,23,42,0.6)',
        border: `1px solid ${open ? color + '30' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'border-color 0.3s'
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '1.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: `${color}15`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color
            }}>
              {Icon && <Icon size={18} />}
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'white' }}>{title}</p>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: tierColor, marginTop: '1px' }}>{tierLabel}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>
                {score}<span style={{ fontSize: '0.75rem', color: '#64748b' }}>/{maxScore}</span>
              </p>
            </div>
            <div style={{ color: '#64748b', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: '99px' }}
          />
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.5rem 1.5rem', borderTop: `1px solid ${color}15` }}>
              {explanation && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    Why this score
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.7, fontWeight: 500 }}>{explanation}</p>
                </div>
              )}
              {improvement && (
                <div style={{
                  marginTop: '1rem', padding: '1rem', borderRadius: '12px',
                  background: `${color}08`, border: `1px solid ${color}20`
                }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                    How to improve
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, fontWeight: 500 }}>{improvement}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Skeleton — Loading placeholder with shimmer animation.
 */
export const Skeleton = ({ width = '100%', height = '16px', borderRadius = '8px', style = {} }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style
    }}
  >
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    ` }} />
  </div>
);

/**
 * ScoreBar — Labeled horizontal progress bar showing score/max with color.
 * Used in the Career Readiness breakdown section.
 */
export const ScoreBar = ({ label, score, maxScore = 25, color = '#6366f1', delay = 0 }) => {
  const pct = Math.round((score / maxScore) * 100);
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>
          {score}<span style={{ color: '#475569', fontWeight: 600 }}>/{maxScore}</span>
        </span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay, ease: 'easeOut' }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}80)`, borderRadius: '99px' }}
        />
      </div>
    </div>
  );
};
