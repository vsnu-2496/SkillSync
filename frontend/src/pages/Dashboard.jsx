/**
 * Dashboard.jsx — Career Intelligence Platform
 * ─────────────────────────────────────────────────────────────────────
 * EXECUTIVE SUMMARY ONLY. No charts, no repeated report data.
 *
 * Shows:
 *  1. Career Readiness % + ATS Score hero
 *  2. Industry Ready badge
 *  3. Target Company & Role
 *  4. Top 5 Missing Skills
 *  5. Quick Recommendations (3)
 *  6. Continue / Analyze CTA
 *  7. Platform navigation cards
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, Zap, Target, ArrowRight, Building2, FileText,
  MessagesSquare, CheckCircle2, AlertCircle, TrendingUp,
  History, Briefcase, ShieldCheck, BookOpen, RefreshCw,
  ChevronRight, Award, Clock, Cpu
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useAnalysis } from '../context/AnalysisContext';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge } from '../components/ui';

// ─── Tier helper ─────────────────────────────────────────────────────
const getTier = (score) => {
  if (score >= 80) return { label: 'Industry Ready',  color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  };
  if (score >= 65) return { label: 'On Track',        color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  };
  if (score >= 50) return { label: 'Developing',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  };
  return           { label: 'Early Stage',            color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',  border: 'rgba(244,63,94,0.15)'  };
};

const Dashboard = () => {
  const { analysis, loading: analysisLoading, hasAnalysis, refresh } = useAnalysis();
  const [dashData,   setDashData]   = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const navigate = useNavigate();

  // Dashboard still calls its own lightweight API for activity/vault data
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
  const missingSkills = hasAnalysis && analysis ? (analysis.missingSkills || []).slice(0, 6) : [];
  const quickRecs = hasAnalysis && analysis
    ? [
        ...(analysis.recommendations?.projects     || []).slice(0, 1).map(r => ({ type: 'Project',      item: r, color: '#6366f1' })),
        ...(analysis.recommendations?.certifications || []).slice(0, 1).map(r => ({ type: 'Cert',       item: r, color: '#f59e0b' })),
        ...(analysis.recommendations?.skills       || []).slice(0, 1).map(r => ({ type: 'Skill',        item: r, color: '#10b981' }))
      ]
    : [];

  const handleViewReport = async () => {
    if (!analysis) return;
    sessionStorage.setItem('careerAnalysis', JSON.stringify({ ...analysis, analysisId: analysis.analysisId, fromHistory: true }));
    navigate('/career-report');
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Career"
        gradient="Intelligence"
        subtitle="Your AI-powered career readiness platform. One analysis, every insight."
        badge={<Badge variant="primary" icon={Zap}>SkillSync AI Platform</Badge>}
      />

      {/* ── HERO: Career Readiness + ATS ── */}
      {hasAnalysis && analysis ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))',
          border: '1px solid rgba(99,102,241,0.2)', borderRadius: '24px',
          padding: '2rem', marginBottom: '2rem',
          display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '2rem', alignItems: 'center'
        }}>
          {/* Left: Big score */}
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

          {/* Center: Company/Role + sub-scores */}
          <div>
            <p style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Current Target</p>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', marginBottom: '2px' }}>{analysis.jobRole}</h3>
            <p style={{ fontSize: '0.9rem', color: '#818cf8', fontWeight: 600, marginBottom: '1.25rem' }}>@ {analysis.company}</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { label: 'ATS Score',   value: analysis.atsScore,       color: '#10b981' },
                { label: 'Keywords',    value: analysis.keywordMatch,   color: '#a855f7' },
                { label: 'Projected',   value: analysis.estimatedScoreAfterImprovements, color: '#f59e0b' },
                { label: 'Interests',   value: analysis.interestScore,  color: '#6366f1' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.35rem', fontWeight: 900, color, lineHeight: 1 }}>{value || 0}%</p>
                  <p style={{ fontSize: '0.58rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '150px' }}>
            <button onClick={handleViewReport} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <FileText size={15} /> Full Report
            </button>
            <button onClick={() => { sessionStorage.setItem('reanalyze', JSON.stringify({ company: analysis.company, jobRole: analysis.jobRole, force: true })); navigate('/resume'); }} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)', color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Re-analyze
            </button>
            <button onClick={() => navigate('/history')} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <History size={14} /> History
            </button>
          </div>
        </div>
      ) : (
        /* No analysis yet — onboarding CTA */
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.03))', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '24px', padding: '3rem 2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Brain size={32} color="white" />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Start Your Career Analysis</h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Upload your resume, select a company and role — get your Career Readiness Score, ATS analysis, skill gaps, and personalized roadmap in seconds.
          </p>
          <Link to="/resume" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '0.9rem 2rem', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} /> Analyze My Resume
            </button>
          </Link>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Top Missing Skills */}
          {hasAnalysis && missingSkills.length > 0 && (
            <GlassCard style={{ border: '1px solid rgba(244,63,94,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244,63,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={18} color="#f43f5e" />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>Top Missing Skills</h4>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>From your {analysis.company} — {analysis.jobRole} JD</p>
                  </div>
                </div>
                <Link to="/skill-gap" style={{ textDecoration: 'none', fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  Full Matrix <ChevronRight size={13} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {missingSkills.map(skill => (
                  <span key={skill} style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', color: '#f43f5e', fontSize: '0.78rem', fontWeight: 700 }}>{skill}</span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Quick Recommendations */}
          {hasAnalysis && quickRecs.length > 0 && (
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={18} color="#6366f1" />
                  </div>
                  <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>Quick Recommendations</h4>
                </div>
                <Link to="/career-report" style={{ textDecoration: 'none', fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  See All <ChevronRight size={13} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {quickRecs.map(({ type, item, color }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '8px', background: `${color}15`, color, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{type}</span>
                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, flex: 1 }}>{typeof item === 'string' ? item : item?.name || item?.title || JSON.stringify(item)}</span>
                    <ChevronRight size={14} color="#475569" />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Platform Navigation Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { path: '/careers',      icon: Briefcase,     label: 'Career Mapping',   desc: 'Readiness breakdown & roles',     color: '#6366f1', badge: hasAnalysis ? `${analysis?.careerReadiness || 0}%` : null },
              { path: '/skill-gap',    icon: Target,        label: 'Skill Matrix',     desc: 'Matched & missing skills',         color: '#a855f7', badge: hasAnalysis ? `${(analysis?.matchedSkills||[]).length} matched` : null },
              { path: '/companies',    icon: Building2,     label: 'Company Explorer', desc: 'Browse roles & JDs',               color: '#10b981', badge: 'Live' },
              { path: '/interview-prep', icon: MessagesSquare, label: 'Interview Prep', desc: 'Questions by company & round',   color: '#f59e0b', badge: null },
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

        {/* ── RIGHT COLUMN: Activity + Quick Actions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Analysis Status Card */}
          <GlassCard style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={18} color="#10b981" />
              </div>
              <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>Platform Status</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'AI Analysis', status: hasAnalysis ? 'Completed' : 'Not Started', ok: hasAnalysis },
                { label: 'Career Mapping', status: hasAnalysis ? 'Ready' : 'Pending Analysis', ok: hasAnalysis },
                { label: 'Skill Matrix', status: hasAnalysis ? 'Synced' : 'Pending Analysis', ok: hasAnalysis },
                { label: 'Company Match', status: hasAnalysis ? `${analysis?.company || '—'}` : 'No Target', ok: hasAnalysis },
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

          {/* Interview Suite Quick Links */}
          <GlassCard style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Interview Suite</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { path: '/mock-interview',   icon: Cpu,         label: 'Mock Interview',   color: '#6366f1' },
                { path: '/interview-vault',  icon: BookOpen,    label: 'Interview Vault',  color: '#a855f7' },
                { path: '/companies',        icon: Building2,   label: 'Explore Companies', color: '#10b981' },
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

          {/* Recent Activity from dashboard API */}
          {dashData?.recentActivity?.length > 0 && (
            <GlassCard style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Placement Radar</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dashData.recentActivity.slice(0, 3).map((msg, i) => (
                  <div key={i} style={{ paddingLeft: '1rem', borderLeft: '2px solid rgba(99,102,241,0.2)', fontSize: '0.78rem', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
                    {msg}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
