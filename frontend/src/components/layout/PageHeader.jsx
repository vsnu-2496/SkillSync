import React from 'react';

/**
 * PageHeader
 * Consistent heading block for all inner app pages.
 *
 * Props:
 *   title    — main heading text (plain)
 *   gradient — optional portion of title rendered with text-gradient
 *   subtitle — supporting description line
 *   badge    — optional JSX badge/pill rendered right-aligned
 */
const PageHeader = ({ title, gradient, subtitle, badge }) => (
  <div className="mb-10 animate-fade-up">
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {badge}
      {badge && <div className="w-1 h-1 rounded-full bg-slate-700" />}
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
        Neural Logic Terminal
      </span>
    </div>
    
    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
      {title} <span className="text-gradient">{gradient}</span>
    </h1>
    
    {subtitle && (
      <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

export default PageHeader;
