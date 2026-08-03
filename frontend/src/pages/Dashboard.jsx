/**
 * Dashboard.jsx — AI Career Intelligence Platform
 * ─────────────────────────────────────────────────────────────────────
 * EXECUTIVE SUMMARY & CAREER RECOMMENDATION HIGHLIGHT.
 *
 * Core Question Answered: "What career role best suits this student?"
 *
 * Displays:
 *  1. Large Career Readiness Score + Industry Ready Badge
 *  2. AI Evidence-Based Best Recommended Career Role & Match %
 *  3. Target Company & Role Context
 *  4. Top Matching Skills & Top Missing Skills
 *  5. Top 3 AI Recommendations (Projects, Certifications, Skills)
 *  6. Learning Roadmap Preview (Next 2 Action Items)
 *  7. Executive Quick Actions (Career Report, Companies, Prep, New Resume)
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, Zap, Target, ArrowRight, Building2, FileText,
  MessagesSquare, CheckCircle2, AlertCircle, TrendingUp,
  History, Briefcase, ShieldCheck, BookOpen, RefreshCw,
  ChevronRight, Award, Clock, Cpu, Sparkles, Star
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useAnalysis } from '../context/AnalysisContext';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge } from '../components/ui';

const getTier = (score) => {
  if (score >= 80) return { label: 'Industry Ready',  color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  };
  if (score >= 65) return { label: 'On Track',        color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  };
  if (score >= 50) return { label: 'Developing',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  };
  return           { label: 'Early Stage',            color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',  border: 'rgba(244,63,94,0.15)'  };
};

const Dashboard = () => {
  const { analysis, loading: analysisLoading, hasAnalysis } = useAnalysis();
  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard')
      .then(res => { if (res.data.success) setDashData(res.data.data); })
      .catch(() => {})
      .finally(() => setDashLoading(false));
  }, []);

  const loading = analysisLoading || dashLoading;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading Career Intelligence...</p>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    );
  }

  const tier = hasAnalysis && analysis ? getTier(analysis.careerReadiness || 0) : null;
  const bestRole = analysis?.bestCareerRole || analysis?.jobRole || 'Full Stack Developer';
  const bestMatch = analysis?.bestCareerMatchPercentage || 88;
  const matchedSkills = hasAnalysis && analysis ? (analysis.matchedSkills || []).slice(0, 5) : [];
  const missingSkills = hasAnalysis && analysis ? (analysis.missingSkills || []).slice(0, 5) : [];
  const roadmapPreview = hasAnalysis && analysis ? (analysis.roadmap || []).slice(0, 2) : [];

  const handleViewReport = () => {
    if (!analysis) return;
    sessionStorage.setItem('careerAnalysis', JSON.stringify({ ...analysis, analysisId: analysis.analysisId, fromHistory: true }));
    navigate('/career-report');
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Career"
        gradient="Intelligence"
        subtitle="AI Evidence-Based Placement Readiness & Career Recommendation Platform."
        badge={<Badge variant="primary" icon={Zap}>Placement Platform</Badge>}
      />

      {/* ── HERO: AI BEST RECOMMENDED CAREER ROLE & READINESS ── */}
      {hasAnalysis && analysis ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))',
          border: '1px solid rgba(99,102,241,0.25)', borderRadius: '24px',
          padding: '2rem', marginBottom: '2rem',
          display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '2rem', alignItems: 'center'
        }}>
          {/* Left: Circular Readiness Score */}
          <div style={{ textAlign: 'center', minWidth: '110px' }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="8" />
                <circle cx="55" cy="55" r="46" fill="none"
                  stroke={tier.color} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - (analysis.careerReadiness || 0) / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{analysis.careerReadiness || 0}%</p>
                <p style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Readiness</p>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: tier.bg, border: `1px solid ${tier.border}`, display: 'inline-block' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: tier.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tier.label}</span>
            </div>
          </div>

          {/* Center: Evidence-Based Best Recommended Role */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <Sparkles size={14} color="#6366f1" />
              <span style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Best Recommended Career Role</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {bestRole}
              <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 800 }}>
                {bestMatch}% Match
              </span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Evaluated against your resume skills, projects, and target context ({analysis.jobRole} @ {analysis.company}).
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { label: 'ATS Score',   value: `${analysis.atsScore}%`,       color: '#10b981' },
                { label: 'Keywords',    value: `${analysis.keywordMatch}%`,   color: '#a855f7' },
                { label: 'Target Company', value: analysis.company,           color: '#6366f1' },
                { label: 'Target Score', value: `${analysis.estimatedScoreAfterImprovements || analysis.careerReadiness}%`, color: '#f59e0b' }
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: '0.58rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: '160px' }}>
            <Link to="/careers" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Briefcase size={15} /> Career Roles
              </button>
            </Link>
            <button onClick={handleViewReport} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)', color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <FileText size={14} /> Full Report
            </button>
            <Link to="/resume" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Zap size={14} /> Upload Resume
              </button>
            </Link>
          </div>
        </div>
      ) : (
        /* No analysis yet — onboarding CTA */
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.03))', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '24px', padding: '3rem 2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Brain size={32} color="white" />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Discover Your Best Career Match</h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500, marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
            Upload your resume to discover your evidence-based top recommended career roles, readiness scores, and target company match analysis.
          </p>
          <Link to="/resume" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '0.9rem 2rem', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} /> Run AI Career Recommendation
            </button>
          </Link>
        </div>
      )}

      {/* ── MAIN GRID: Executive Summary Panels ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Top Matching vs Top Missing Skills */}
          {hasAnalysis && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Top Matching Skills */}
              <GlassCard style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981' }}>
                  <CheckCircle2 size={18} />
                  <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>Top Matching Skills</h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {matchedSkills.length > 0 ? matchedSkills.map(s => (
                    <span key={s} style={{ padding: '0.3rem 0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.78rem', fontWeight: 700 }}>
                      ✓ {s}
                    </span>
                  )) : <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No direct matches.</p>}
                </div>
              </GlassCard>

              {/* Top Missing Skills */}
              <GlassCard style={{ padding: '1.5rem', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f43f5e' }}>
                  <AlertCircle size={18} />
                  <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>Top Missing Skills</h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {missingSkills.length > 0 ? missingSkills.map(s => (
                    <span key={s} style={{ padding: '0.3rem 0.75rem', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', fontSize: '0.78rem', fontWeight: 700 }}>
                      ✗ {s}
                    </span>
                  )) : <p style={{ fontSize: '0.8rem', color: '#10b981' }}>All key skills matched!</p>}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Learning Roadmap Preview */}
          {hasAnalysis && roadmapPreview.length > 0 && (
            <GlassCard style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1' }}>
                  <Clock size={18} />
                  <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>Learning Roadmap Preview</h4>
                </div>
                <Link to="/careers" style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  Full Roadmap <ChevronRight size={13} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {roadmapPreview.map((step, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500 }}>{step}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Platform Navigation Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { path: '/careers',        icon: Briefcase,     label: 'Career Recommendations', desc: 'Ranked career roles & evidence', color: '#6366f1', badge: hasAnalysis ? `${bestMatch}% Match` : null },
              { path: '/companies',      icon: Building2,     label: 'Company Explorer',      desc: 'Browse jobs, JDs & matches',     color: '#10b981', badge: 'Live' },
              { path: '/interview-prep', icon: MessagesSquare, label: 'Interview Prep',        desc: 'Questions by company & role',   color: '#f59e0b', badge: null },
              { path: '/mock-interview', icon: Cpu,            label: 'Mock Interview',        desc: 'AI Voice & technical practice', color: '#a855f7', badge: null },
            ].map(({ path, icon: Icon, label, desc, color, badge }) => (
              <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '1rem' }}
                  onMouseOver={e => { e.currentTarget.style.border = `1px solid ${color}30`; e.currentTarget.style.background = `${color}08`; }}
                  onMouseOut={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, color: 'white', fontSize: '0.875rem', marginBottom: '2px' }}>{label}</p>
                    <p style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500 }}>{desc}</p>
                  </div>
                  {badge && (
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '8px', background: `${color}15`, color, fontSize: '0.6rem', fontWeight: 800, flexShrink: 0 }}>{badge}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Quick Actions & Status ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Quick Actions Panel */}
          <GlassCard style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Executive Quick Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { path: '/career-report',    icon: FileText,       label: 'View Career Report',     color: '#6366f1' },
                { path: '/companies',        icon: Building2,      label: 'Explore Companies',      color: '#10b981' },
                { path: '/interview-prep',   icon: MessagesSquare, label: 'Start Interview Prep',   color: '#f59e0b' },
                { path: '/resume',           icon: Zap,            label: 'Upload New Resume',      color: '#a855f7' },
              ].map(({ path, icon: Icon, label, color }) => (
                <Link key={path} to={path} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s', color: '#94a3b8', fontWeight: 600, fontSize: '0.82rem' }}
                  onMouseOver={e => { e.currentTarget.style.background = `${color}08`; e.currentTarget.style.color = color; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <Icon size={16} /> {label}
                  <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </GlassCard>

          {/* Analysis Status */}
          <GlassCard style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={18} color="#10b981" />
              </div>
              <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>Intelligence Status</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Single Source Analysis', status: hasAnalysis ? 'Active' : 'Not Loaded', ok: hasAnalysis },
                { label: 'Best Career Role', status: hasAnalysis ? bestRole : 'Pending', ok: hasAnalysis },
                { label: 'Target Company', status: hasAnalysis ? `${analysis?.company || '—'}` : 'No Target', ok: hasAnalysis },
              ].map(({ label, status, ok }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ok ? '#10b981' : '#475569' }} />
                    <span style={{ fontSize: '0.72rem', color: ok ? '#10b981' : '#475569', fontWeight: 700 }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
