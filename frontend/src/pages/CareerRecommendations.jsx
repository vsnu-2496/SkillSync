/**
 * CareerRecommendations.jsx — Career Mapping Page
 * ─────────────────────────────────────────────────────────────────────
 * Analysis-driven Career Mapping page powered by global AnalysisContext.
 *
 * Displays:
 *  1. Primary Career Alignment & Target Target Role Match %
 *  2. 4-Category Contribution Grid (Interest, Projects, Internships, Certifications - 25% each)
 *  3. Sub-score Radar Chart & Radar Metrics
 *  4. Explainable AI Score Justifications (whyThisScore)
 *  5. Recommended Roles & Career Path Trajectory
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Target, Brain, Award, Zap, Building2, CheckCircle2,
  XCircle, ArrowRight, TrendingUp, HelpCircle, ShieldCheck, Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';
import { useAnalysis } from '../context/AnalysisContext';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge, ScoreBar, ProgressBar } from '../components/ui';

const CareerRecommendations = () => {
  const { analysis, loading, hasAnalysis } = useAnalysis();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column' }}>
        <div style={{ width: '45px', height: '45px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Loading Career Mapping...</p>
      </div>
    );
  }

  if (!hasAnalysis || !analysis) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          title="Career"
          gradient="Mapping"
          subtitle="Strategic career domains architected from your professional profile and neural benchmarks."
          badge={<Badge variant="warning">No Analysis Data</Badge>}
        />
        <GlassCard style={{ textAlign: 'center', padding: '4rem 2rem', margin: '2rem 0' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', margin: '0 auto 1.5rem' }}>
            <Brain size={40} />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Career Mapping Locked</h3>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
            Please upload your resume and select a target company & role to generate your detailed career readiness mapping and skill suitability matrix.
          </p>
          <Link to="/resume" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button variant="primary" size="lg" icon={Zap}>Initialize Career Analysis</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  // 4 category scores out of 25
  const interestScore     = analysis.interestScore || 0;
  const projectScore      = analysis.projectScore || 0;
  const internshipScore   = analysis.internshipScore || 0;
  const certificationScore= analysis.certificationScore || 0;

  const radarData = [
    { category: 'Area of Interest', score: Math.round((interestScore / 25) * 100), fullMark: 100 },
    { category: 'Projects',        score: Math.round((projectScore / 25) * 100), fullMark: 100 },
    { category: 'Internships',     score: Math.round((internshipScore / 25) * 100), fullMark: 100 },
    { category: 'Certifications',  score: Math.round((certificationScore / 25) * 100), fullMark: 100 },
    { category: 'ATS Synergy',     score: analysis.atsScore || 0, fullMark: 100 }
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Career"
        gradient="Mapping"
        subtitle="Strategic career suitabilities architected from your AI Resume Analysis & Target Benchmarks."
        badge={<Badge variant="success" icon={ShieldCheck}>Neural Mapping Active</Badge>}
      />

      {/* ── TOP HERO: Primary Target Alignment ── */}
      <GlassCard style={{ marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.2)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.03))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Primary Career Trajectory</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginTop: '0.25rem' }}>
              {analysis.jobRole} <span style={{ color: '#818cf8', fontWeight: 600 }}>@ {analysis.company}</span>
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem', maxWidth: '600px' }}>
              Evaluated against real-world job requirements and benchmarked across 4 core career pillars (25% weightage each).
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '1.25rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '2.75rem', fontWeight: 900, color: analysis.careerReadiness >= 75 ? '#10b981' : (analysis.careerReadiness >= 55 ? '#6366f1' : '#f59e0b'), lineHeight: 1 }}>
              {analysis.careerReadiness}%
            </p>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>Overall Career Readiness</p>
          </div>
        </div>
      </GlassCard>

      {/* ── GRID: 4-Pillar Breakdown & Radar Chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

        {/* Left: 4 Contribution Pillars */}
        <GlassCard style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Target size={20} color="#6366f1" />
            Career Readiness Breakdown (25% Each)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <ScoreBar label="Area of Interest Alignment" score={interestScore} maxScore={25} color="#6366f1" />
            <ScoreBar label="Relevant Projects Contribution" score={projectScore} maxScore={25} color="#a855f7" />
            <ScoreBar label="Internships & Practical Exp" score={internshipScore} maxScore={25} color="#f59e0b" />
            <ScoreBar label="Certifications & Verifications" score={certificationScore} maxScore={25} color="#10b981" />
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>Projected Readiness After Recommendations:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{analysis.estimatedScoreAfterImprovements || analysis.careerReadiness}%</span>
          </div>
        </GlassCard>

        {/* Right: Radar Chart Visualization */}
        <GlassCard style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain size={20} color="#a855f7" />
            Competency Radar
          </h3>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="category" stroke="#64748b" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={9} />
                <Radar name="Suitability" dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* ── EXPLAINABLE AI SECTION ── */}
      {analysis.whyThisScore && (
        <GlassCard style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={20} color="#f59e0b" />
            Explainable AI Score Rationale
          </h3>

          {typeof analysis.whyThisScore === 'string' ? (
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>{analysis.whyThisScore}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {analysis.whyThisScore.positiveFactors && (
                <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Positive Factors</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {analysis.whyThisScore.positiveFactors.map((item, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.whyThisScore.negativeFactors && (
                <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Areas For Improvement</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {analysis.whyThisScore.negativeFactors.map((item, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <XCircle size={16} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* ── RECOMMENDED ROLES / NEXT STEPS ── */}
      <GlassCard style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Recommended Action Trajectory</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>Next steps to bridge your readiness gaps for {analysis.company}</p>
          </div>
          <Link to="/skill-gap" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" icon={ArrowRight}>View Skill Matrix</Button>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#6366f1' }}>
              <Briefcase size={20} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Target Projects</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {(analysis.recommendations?.projects?.[0] && (typeof analysis.recommendations.projects[0] === 'string' ? analysis.recommendations.projects[0] : analysis.recommendations.projects[0].title)) || "Build microservices or full-stack projects aligned with target company technology stack."}
            </p>
          </div>

          <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#f59e0b' }}>
              <Award size={20} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Recommended Certs</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {(analysis.recommendations?.certifications?.[0] && (typeof analysis.recommendations.certifications[0] === 'string' ? analysis.recommendations.certifications[0] : analysis.recommendations.certifications[0].name)) || "Acquire cloud or specialized technical certifications to boost verification score."}
            </p>
          </div>

          <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#10b981' }}>
              <Building2 size={20} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Target Internships</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {(analysis.recommendations?.internships?.[0] && (typeof analysis.recommendations.internships[0] === 'string' ? analysis.recommendations.internships[0] : analysis.recommendations.internships[0].role)) || "Target internships focusing on practical software engineering, cloud ops, or web development."}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default CareerRecommendations;
