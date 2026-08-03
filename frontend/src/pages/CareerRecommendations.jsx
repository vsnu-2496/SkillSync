/**
 * CareerRecommendations.jsx — Career Recommendation Engine Page
 * ─────────────────────────────────────────────────────────────────────
 * THE PRIMARY OUTPUT FEATURE OF THE PLATFORM.
 *
 * Displays:
 *  - Best Career Domain
 *  - Top Job Roles Ranked with Confidence Percentages
 *  - Why AI Selected Them (Evidence Rationale)
 *  - Skills Supporting Each Recommendation (Matched Skills)
 *  - Missing Skills for Each Role
 *  - Estimated Readiness After Improvements
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Sparkles, Building2, CheckCircle2, AlertCircle,
  ArrowRight, ShieldCheck, Zap, Award, BookOpen, Layers, DollarSign,
  TrendingUp, Compass
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge } from '../components/ui';

const CareerRecommendations = () => {
  const { analysis, loading, hasAnalysis } = useAnalysis();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Ranking Recommended Career Roles...</p>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
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
        <GlassCard style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', margin: '0 auto 1.5rem' }}>
            <Sparkles size={36} />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Career Recommendation Engine Locked</h3>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
            Upload your resume to allow our AI engine to evaluate your technical skills, projects, and background to recommend your top career roles.
          </p>
          <Link to="/resume" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" icon={Zap}>Upload Resume For Recommendation</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const bestDomain = analysis.bestCareerDomain || 'Software & Web Engineering';
  const bestRole = analysis.bestCareerRole || analysis.jobRole || 'Full Stack Developer';
  const bestMatch = analysis.bestCareerMatchPercentage || 88;
  const estimatedReadiness = analysis.estimatedScoreAfterImprovements || Math.min(98, bestMatch + 10);

  // Ranked roles array directly from ResumeAnalysis context
  const rankedRoles = (analysis.rankedCareerRoles && analysis.rankedCareerRoles.length > 0)
    ? analysis.rankedCareerRoles
    : [
        {
          role: bestRole,
          matchPercentage: bestMatch,
          whyRecommended: `Your resume demonstrates strong hands-on proficiency and project experience in ${bestRole}.`,
          matchedSkills: analysis.matchedSkills || ['JavaScript', 'React', 'Node.js'],
          missingSkills: analysis.missingSkills || ['TypeScript', 'Docker'],
          growthPotential: 'Extremely High',
          avgSalary: '₹12L – ₹30L',
          hiringDemand: 'Very High',
          companiesHiring: ['Google', 'Microsoft', 'Swiggy', 'Zoho', 'Infosys'],
          roadmap: analysis.roadmap || ['Master TypeScript and static typing', 'Build Microservices Architecture', 'Practice System Design'],
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
        subtitle={`Best Career Domain: ${bestDomain}. Ranked roles derived automatically from your technical background.`}
        badge={<Badge variant="success" icon={ShieldCheck}>Single Source of Truth Active</Badge>}
      />

      {/* ── TOP CAREER MATCH HERO ── */}
      <GlassCard style={{ marginBottom: '2rem', padding: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Compass size={16} color="#6366f1" />
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                PRIMARY CAREER DOMAIN: {bestDomain.toUpperCase()}
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', margin: '0.2rem 0' }}>
              #1 {bestRole}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '650px', lineHeight: 1.5 }}>
              {(rankedRoles[0] && rankedRoles[0].whyRecommended) || analysis.whyThisScore || 'Evidence-based career fit evaluated from your extracted skills and project background.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: 'rgba(15,23,42,0.7)', borderRadius: '18px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{bestMatch}%</p>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginTop: '0.3rem' }}>Current Match</p>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: 'rgba(15,23,42,0.7)', borderRadius: '18px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6366f1', lineHeight: 1 }}>{estimatedReadiness}%</p>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginTop: '0.3rem' }}>Target Readiness</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── RANKED CAREER CARDS LIST ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="#6366f1" /> Ranked Career Roles in {bestDomain} ({rankedRoles.length})
        </h3>

        {rankedRoles.map((item, idx) => (
          <GlassCard key={idx} style={{ padding: '2rem', border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
            {/* Header: Title + Match % */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: idx === 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem' }}>
                  #{idx + 1}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: 0 }}>
                    {item.role} <span style={{ color: item.matchPercentage >= 85 ? '#10b981' : (item.matchPercentage >= 70 ? '#6366f1' : '#f59e0b'), fontSize: '1.2rem', fontWeight: 900, marginLeft: '0.5rem' }}>— {item.matchPercentage}%</span>
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                    Growth Potential: <span style={{ color: '#10b981', fontWeight: 700 }}>{item.growthPotential || 'High'}</span> • Salary: <span style={{ color: '#818cf8', fontWeight: 700 }}>{item.avgSalary || '₹10L – ₹25L'}</span> • Difficulty: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{item.interviewDifficulty || 'Hard'}</span>
                  </p>
                </div>
              </div>

              <Link to="/companies" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" icon={Building2}>
                  Explore Companies
                </Button>
              </Link>
            </div>

            {/* Why AI Selected This Role */}
            <div style={{ padding: '1rem 1.25rem', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.12)', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Why AI Selected This Role</p>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>{item.whyRecommended}</p>
            </div>

            {/* Skills Grid: Supporting vs Missing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Supporting Resume Skills</p>
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

            {/* Improvement Roadmap */}
            {item.roadmap && item.roadmap.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Improvement Roadmap</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {item.roadmap.map((step, i) => (
                    <div key={i} style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Required Certifications</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{(item.requiredCertifications || ['AWS Certified Developer']).join(', ')}</p>
              </div>

              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Recommended Projects</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{(item.requiredProjects || ['Full Stack Application']).join(', ')}</p>
              </div>

              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Companies Hiring</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{(item.companiesHiring || ['Google', 'Microsoft', 'Zoho']).join(', ')}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default CareerRecommendations;
