import React from 'react';

const PageSection = ({ children, narrow = false, className = '' }) => (
  <div
    style={{
      maxWidth: narrow ? '1000px' : '1400px',
      margin: '0 auto',
      paddingBottom: '4rem',
      paddingTop: '1.5rem'
    }}
    className={`animate-fade-up ${className}`}
  >
    {children}
  </div>
);

export default PageSection;
