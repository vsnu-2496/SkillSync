/**
 * Dashboard.jsx — AI Career Intelligence Platform
 * ─────────────────────────────────────────────────────────────────────
 * EXECUTIVE CAREER RECOMMENDATION DASHBOARD.
 *
 * Core Question Answered: "What is the best career for this student?"
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, AlertCircle, Briefcase, Building2,
  FileText, ArrowRight, Zap, Award, Target, User, ShieldCheck,
  Compass, AlertTriangle, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge } from '../components/ui';

const Dashboard = () => {
  const { user } = useAuth();
  const { analysis, loading, hasAnalysis } = useAnalysis();
  const navigate = useNavigate();

  console.log('[Dashboard Render] loading:', loading, 'hasAnalysis:', hasAnalysis, 'hasAnalysisObject:', Boolean(analysis), 'Role:', analysis?.bestCareerRole || analysis?.jobRole);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Loading Career Intelligence...</p>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    );
  }

  const handleViewReport = () => {
    if (!analysis) return;
    sessionStorage.setItem('careerAnalysis', JSON.stringify({ ...analysis, fromHistory: true }));
    navigate('/career-report');
  };

  const bestDomain = analysis?.bestCareerDomain || 'Software & Web Engineering';
  const bestRole = analysis?.bestCareerRole || analysis?.jobRole || 'Full Stack Developer';
  const bestMatch = analysis?.bestCareerMatchPercentage || 88;
  const readiness = analysis?.careerReadiness || 0;
  const atsScore = analysis?.atsScore || 0;
  const selectedRole = analysis?.jobRole;

  const isSelectedRoleWeak = selectedRole && selectedRole.toLowerCase() !== bestRole.toLowerCase();

  // Extract 3-5 bullet points for "Why this recommendation"
  const whyBulletPoints = [];
  if (analysis?.strengths && analysis.strengths.length > 0) {
    whyBulletPoints.push(...analysis.strengths.slice(0, 3));
  }
  if (analysis?.whyThisScore && whyBulletPoints.length < 4) {
    whyBulletPoints.push(analysis.whyThisScore);
  }
  if (whyBulletPoints.length === 0) {
    whyBulletPoints.push(`Demonstrated technical proficiency matching ${bestRole} requirements.`);
    whyBulletPoints.push(`Strong core skill alignment extracted directly from your resume.`);
    whyBulletPoints.push(`High hiring demand across target industry partners.`);
  }

  const matchedSkills = (analysis?.matchedSkills || []).slice(0, 6);
  const missingSkills = (analysis?.missingSkills || []).slice(0, 6);
  const recommendedCerts = (analysis?.recommendations?.certifications || ['AWS Certified Developer', 'Meta Frontend Certificate']).slice(0, 3);
  const recommendedCompanies = (analysis?.rankedCareerRoles?.[0]?.companiesHiring || ['Google', 'Microsoft', 'Amazon', 'Swiggy', 'Zoho']).slice(0, 5);
  const rankedRoles = analysis?.rankedCareerRoles || [];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Career"
        gradient="Intelligence"
        subtitle="AI Evidence-Based Placement Readiness & Career Recommendation Dashboard."
        badge={<Badge variant="primary" icon={Zap}>Executive View</Badge>}
      />

      {/* ── 1. WELCOME CARD ── */}
      <GlassCard style={{ marginBottom: '1.75rem', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>Welcome back, {user?.name || 'Candidate'}!</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Domain: <span style={{ color: '#818cf8', fontWeight: 700 }}>{bestDomain}</span> • {hasAnalysis ? 'Analysis Active' : 'Pending Resume Upload'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="primary" size="sm" icon={FileText} onClick={handleViewReport} disabled={!hasAnalysis}>
            Continue Career Report
          </Button>
          <Link to="/resume" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" icon={Zap}>Analyze New Resume</Button>
          </Link>
        </div>
      </GlassCard>

      {(hasAnalysis || Boolean(analysis)) ? (
        <>

          {/* ── WEAK TARGET ROLE ALERT BANNER (If Selected Role != Best Recommended Role) ── */}
          {isSelectedRoleWeak && (
            <div style={{
              marginBottom: '1.75rem', padding: '1.25rem 1.5rem', borderRadius: '16px',
              background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
              <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b' }}>Target Role Alignment Notice</p>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '2px', lineHeight: 1.4 }}>
                  You selected <strong style={{ color: 'white' }}>{selectedRole}</strong>, but your resume skills and projects strongly align with <strong style={{ color: '#10b981' }}>{bestRole} ({bestMatch}% match)</strong> in the <strong style={{ color: '#818cf8' }}>{bestDomain}</strong> domain. We recommend focusing on {bestRole}!
                </p>
              </div>
            </div>
          )}

          {/* ── 2. LARGEST CARD: BEST CAREER RECOMMENDATION HERO ── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06))',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '24px',
            padding: '2.25rem',
            marginBottom: '1.75rem',
            boxShadow: '0 12px 40px rgba(99,102,241,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Sparkles size={16} color="#6366f1" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    BEST RECOMMENDED CAREER ({bestDomain})
                  </span>
                </div>
                <h1 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: '0.2rem 0' }}>
                  {bestRole}
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '680px', marginTop: '0.5rem' }}>
                  Extracted from your resume's technical skills, project portfolio, and verified experience.
                </p>
              </div>

              {/* Confidence Badge */}
              <div style={{ textAlign: 'center', padding: '1.25rem 2.25rem', background: 'rgba(15,23,42,0.6)', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p style={{ fontSize: '3.2rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{bestMatch}%</p>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.4rem' }}>Confidence Match</p>
              </div>
            </div>

            {/* ── 3. WHY THIS RECOMMENDATION? ── */}
            <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>
                Why This Recommendation? (Top Evidence Points)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
                {whyBulletPoints.map((point, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      ✓
                    </div>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RANKED TOP 5 RECOMMENDED JOB ROLES PREVIEW ── */}
          {rankedRoles.length > 0 && (
            <GlassCard style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1' }}>
                  <Layers size={20} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Top 5 Recommended Job Roles Ranked</h3>
                </div>
                <Link to="/careers" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View All Details <ArrowRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                {rankedRoles.slice(0, 5).map((r, i) => (
                  <div key={i} style={{ padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: i === 0 ? '#10b981' : '#818cf8', width: '24px' }}>#{i + 1}</span>
                      <div>
                        <p style={{ fontWeight: 800, color: 'white', fontSize: '0.92rem' }}>{r.role}</p>
                        <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Salary: {r.avgSalary} • Growth: {r.growthPotential}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: r.matchPercentage >= 85 ? '#10b981' : '#6366f1' }}>
                      {r.matchPercentage}% Match
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* ── SCORES ROW: READINESS, ATS SCORE, INDUSTRY BADGE ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {/* Career Readiness Score */}
            <GlassCard style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Career Readiness Score</span>
                <Target size={16} color="#6366f1" />
              </div>
              <p style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{readiness}%</p>
              <div style={{ marginTop: '0.75rem' }}>
                <Badge variant={readiness >= 80 ? 'success' : (readiness >= 60 ? 'primary' : 'warning')}>
                  {readiness >= 80 ? 'Industry Ready' : (readiness >= 60 ? 'On Track' : 'Needs Improvement')}
                </Badge>
              </div>
            </GlassCard>

            {/* ATS Score */}
            <GlassCard style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>ATS Score (Supporting Metric)</span>
                <FileText size={16} color="#10b981" />
              </div>
              <p style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{atsScore}%</p>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.75rem' }}>Resume ATS parseability rate</p>
            </GlassCard>

            {/* Next Immediate Action */}
            <GlassCard style={{ padding: '1.5rem', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>Next Immediate Action</span>
                <Zap size={16} color="#6366f1" />
              </div>
              <p style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                {missingSkills.length > 0 ? `Learn ${missingSkills[0]} to boost score to 90%+` : 'Practice mock interviews for target role'}
              </p>
              <Link to="/careers" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                View Career Recommendations <ArrowRight size={13} />
              </Link>
            </GlassCard>
          </div>

          {/* ── SKILLS & RECOMMENDATIONS GRID ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
            {/* Top Matching Skills */}
            <GlassCard style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981' }}>
                <CheckCircle2 size={18} />
                <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>Top Strengths & Matching Skills</h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {matchedSkills.map(skill => (
                  <span key={skill} style={{ padding: '0.3rem 0.75rem', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: '0.78rem', fontWeight: 700 }}>
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Missing Skills */}
            <GlassCard style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f43f5e' }}>
                <AlertCircle size={18} />
                <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>Missing Skills To Target</h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {missingSkills.map(skill => (
                  <span key={skill} style={{ padding: '0.3rem 0.75rem', borderRadius: '10px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', fontSize: '0.78rem', fontWeight: 700 }}>
                    ✗ {skill}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ── COMPANIES & CERTIFICATIONS GRID ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Target Companies */}
            <GlassCard style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#6366f1' }}>
                <Building2 size={18} />
                <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>Target Companies Matching Your Profile</h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {recommendedCompanies.map(company => (
                  <Link key={company} to="/companies" style={{ textDecoration: 'none' }}>
                    <span style={{ padding: '0.4rem 0.85rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      🏢 {company}
                    </span>
                  </Link>
                ))}
              </div>
            </GlassCard>

            {/* Recommended Certifications */}
            <GlassCard style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f59e0b' }}>
                <Award size={18} />
                <h4 style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>Recommended Certifications</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recommendedCerts.map((cert, i) => (
                  <div key={i} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700 }}>
                    🎓 {cert}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </>
      ) : (
        /* ONBOARDING CALL TO ACTION (when no resume analyzed yet) */
        <GlassCard style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1.5rem' }}>
            <Sparkles size={36} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Run AI Career Recommendation</h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '520px', margin: '0 auto 2rem' }}>
            Upload your resume to allow our AI engine to analyze your technical background and uncover your highest matching career roles.
          </p>
          <Link to="/resume" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" icon={Zap}>Upload Resume Now</Button>
          </Link>
        </GlassCard>
      )}
    </div>
  );
};

export default Dashboard;
