import React from 'react';
import { motion } from 'framer-motion';

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
    style={{
      padding: '2rem',
      ...style
    }}
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
    danger: { background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)' }
  };
  return (
    <span className="badge" style={styles[variant]}>
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
