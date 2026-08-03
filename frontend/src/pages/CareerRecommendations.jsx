/**
 * CareerRecommendations.jsx — Career Recommendation Engine Page
 * ─────────────────────────────────────────────────────────────────────
 * The primary output feature of the AI Career Intelligence Platform.
 *
 * Displays:
 *  1. Top Evidence-Based Best Recommended Career Role Hero
 *  2. Ranked List of Top 5 Recommended Career Roles with Match %
 *  3. Deep Breakdown per Role:
 *     - Why Recommended (Evidence from resume)
 *     - Matched & Missing Skills
 *     - Growth Potential & Hiring Demand
 *     - Average Salary & Hiring Companies
 *     - Custom Learning Roadmap & Required Projects / Certifications
 *     - Interview Difficulty Level
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Target, Brain, Award, Zap, Building2, CheckCircle2,
  XCircle, ArrowRight, TrendingUp, HelpCircle, ShieldCheck, Sparkles,
  ChevronDown, ChevronUp, DollarSign, Clock, Layers
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge } from '../components/ui';

const CareerRecommendations = () => {
  const { analysis, loading, hasAnalysis } = useAnalysis();
  const [expandedRoleIdx, setExpandedRoleIdx] = useState(0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column' }}>
        <div style={{ width: '45px', height: '45px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Calculating Career Recommendations...</p>
      </div>
    );
  }

  if (!hasAnalysis || !analysis) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          title="Career"
          gradient="Recommendations"
          subtitle="AI Evidence-Based Career Matching & Role Recommendations."
          badge={<Badge variant="warning">No Analysis Data</Badge>}
        />
        <GlassCard style={{ textAlign: 'center', padding: '4rem 2rem', margin: '2rem 0' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', margin: '0 auto 1.5rem' }}>
            <Brain size={40} />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Career Recommendation Engine Locked</h3>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
            Upload your resume to allow our AI engine to analyze your actual technical skills, projects, and internships to recommend your highest matching career roles.
          </p>
          <Link to="/resume" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button variant="primary" size="lg" icon={Zap}>Upload Resume For Recommendation</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const bestRole = analysis.bestCareerRole || analysis.jobRole || 'Full Stack Developer';
  const bestMatch = analysis.bestCareerMatchPercentage || 88;

  // Ranked roles list
  const rankedRoles = (analysis.rankedCareerRoles && analysis.rankedCareerRoles.length > 0)
    ? analysis.rankedCareerRoles
    : [
        {
          role: bestRole,
          matchPercentage: bestMatch,
          whyRecommended: `Strong alignment with your resume skills, projects, and technologies.`,
          matchedSkills: analysis.matchedSkills || ['JavaScript', 'React', 'Node.js'],
          missingSkills: analysis.missingSkills || ['TypeScript', 'Docker'],
          growthPotential: 'Extremely High',
          avgSalary: '₹12L – ₹30L',
          hiringDemand: 'Very High',
          companiesHiring: ['Google', 'Microsoft', 'Swiggy', 'Zoho', 'Infosys'],
          roadmap: analysis.roadmap || ['Learn Advanced TypeScript', 'Build Microservices Architecture', 'Practice System Design'],
          requiredProjects: (analysis.recommendations?.projects || []).slice(0, 2),
          requiredCertifications: (analysis.recommendations?.certifications || []).slice(0, 2),
          interviewDifficulty: 'Hard'
        }
      ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Career"
        gradient="Recommendations"
        subtitle="AI Evidence-Based Career Matching. Ranked roles derived from your actual skills, projects, and background."
        badge={<Badge variant="success" icon={ShieldCheck}>Recommendation Engine Active</Badge>}
      />

      {/* ── BEST MATCH HERO CARD ── */}
      <GlassCard style={{ marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.25)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.04))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Sparkles size={16} color="#6366f1" />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Primary Recommended Role</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white' }}>
              #1 {bestRole}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.4rem', maxWidth: '650px', lineHeight: 1.5 }}>
              {(rankedRoles[0] && rankedRoles[0].whyRecommended) || analysis.whyThisScore || "Derived from your resume's technical skills, project portfolio, and domain experience."}
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1.25rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{bestMatch}%</p>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>Match Confidence</p>
          </div>
        </div>
      </GlassCard>

      {/* ── RANKED ROLES LIST ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="#6366f1" /> Ranked Suitable Career Roles ({rankedRoles.length})
        </h3>

        {rankedRoles.map((item, idx) => {
          const isExpanded = expandedRoleIdx === idx;

          return (
            <GlassCard key={idx} style={{ padding: '1.75rem', border: isExpanded ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.04)' }}>
              {/* Header row */}
              <div
                onClick={() => setExpandedRoleIdx(isExpanded ? -1 : idx)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '1rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: idx === 0 ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.03)', color: idx === 0 ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem' }}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{item.role}</h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                      Growth: <span style={{ color: '#10b981', fontWeight: 700 }}>{item.growthPotential || 'High'}</span> • Salary: <span style={{ color: '#818cf8', fontWeight: 700 }}>{item.avgSalary || '₹10L – ₹25L'}</span>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: 900, color: item.matchPercentage >= 85 ? '#10b981' : (item.matchPercentage >= 70 ? '#6366f1' : '#f59e0b') }}>
                      {item.matchPercentage}%
                    </p>
                    <p style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Suitability</p>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                  {/* Why Recommended */}
                  <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Why Recommended (Evidence Rationale)</p>
                    <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>{item.whyRecommended}</p>
                  </div>

                  {/* Skills Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Matched Resume Skills</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {(item.matchedSkills || []).map(s => (
                          <span key={s} style={{ padding: '0.25rem 0.65rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Missing Skills To Target</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {(item.missingSkills || []).map(s => (
                          <span key={s} style={{ padding: '0.25rem 0.65rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', fontSize: '0.75rem', fontWeight: 700 }}>
                            ✗ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Companies Hiring & Roadmap */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Top Companies Hiring for {item.role}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {(item.companiesHiring || ['Google', 'Microsoft', 'Amazon', 'Swiggy', 'Zoho']).map(c => (
                          <span key={c} style={{ padding: '0.25rem 0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                            🏢 {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Interview Difficulty Level</p>
                      <Badge variant={item.interviewDifficulty === 'Expert' || item.interviewDifficulty === 'Hard' ? 'danger' : 'primary'}>
                        {item.interviewDifficulty || 'Hard'} Level
                      </Badge>
                    </div>
                  </div>

                  {/* Role Roadmap */}
                  {item.roadmap && item.roadmap.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Role Preparation Steps</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {item.roadmap.map((step, i) => (
                          <div key={i} style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                    <Link to="/companies" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm" icon={Building2}>Explore Job Listings</Button>
                    </Link>
                    <Link to="/interview-prep" style={{ textDecoration: 'none' }}>
                      <Button variant="ghost" size="sm" icon={ArrowRight}>Prepare for {item.role}</Button>
                    </Link>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default CareerRecommendations;
