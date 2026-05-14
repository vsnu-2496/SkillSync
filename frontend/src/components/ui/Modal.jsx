import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassCard } from './index';

const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = '800px', sidePanel = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: sidePanel ? 'stretch' : 'center', 
          justifyContent: sidePanel ? 'flex-end' : 'center', 
          padding: sidePanel ? 0 : '2rem', 
          backgroundColor: 'rgba(2, 6, 23, 0.85)', 
          backdropFilter: 'blur(12px)' 
        }}>
          {/* Backdrop click */}
          <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

          <motion.div
            initial={sidePanel ? { x: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            animate={sidePanel ? { x: 0 } : { scale: 1, opacity: 1, y: 0 }}
            exit={sidePanel ? { x: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: sidePanel ? '550px' : maxWidth, 
              height: sidePanel ? '100%' : 'auto',
              maxHeight: sidePanel ? '100%' : '90vh',
              overflowY: 'auto',
              zIndex: 1001
            }}
          >
            <GlassCard 
              hover={false} 
              style={{ 
                height: '100%', 
                borderRadius: sidePanel ? '0' : '28px',
                borderLeft: sidePanel ? '1px solid var(--border)' : '1px solid var(--border)',
                padding: '3rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>{title}</h2>
                  {subtitle && <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.75rem' }}>{subtitle}</p>}
                </div>
                <button 
                  onClick={onClose} 
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--border)', 
                    color: 'white', 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {children}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
