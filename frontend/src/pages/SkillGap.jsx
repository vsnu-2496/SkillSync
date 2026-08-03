/**
 * SkillGap.jsx — Skill Matrix Page
 * ─────────────────────────────────────────────────────────────────────
 * Analysis-driven Skill Matrix page powered by global AnalysisContext.
 *
 * Displays:
 *  1. Skill Matrix Overview (Matched / Missing / Extracted)
 *  2. Strong Skills vs Missing Skills Chips & Categorization
 *  3. Learning Roadmap Steps & Timeline
 *  4. Recommended Certifications & Projects
 *  5. Progress Timeline & Estimated Target Score
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, CheckCircle2, XCircle, TrendingUp, Brain, Zap,
  ArrowRight, ShieldCheck, AlertCircle, Award, Briefcase, BookOpen, Clock, Sparkles
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, ProgressBar } from '../components/ui';

const SkillGap = () => {
  const { analysis, loading, hasAnalysis } = useAnalysis();
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'roadmap' | 'recommendations'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column' }}>
        <div style={{ width: '45px', height: '45px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Loading Skill Matrix...</p>
      </div>
    );
  }

  if (!hasAnalysis || !analysis) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          title="Skill"
          gradient="Matrix"
          subtitle="Precision skill gap audit benchmarked against target company job roles."
          badge={<Badge variant="warning">No Analysis Data</Badge>}
        />
        <GlassCard style={{ textAlign: 'center', padding: '4rem 2rem', margin: '2rem 0' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', margin: '0 auto 1.5rem' }}>
            <Target size={40} />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Skill Matrix Inactive</h3>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
            Run your resume analysis to generate a personalized skill matrix comparing your extracted competencies against target job requirements.
          </p>
          <Link to="/resume" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button variant="primary" size="lg" icon={Zap}>Run Analysis Now</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const matchedSkills  = analysis.matchedSkills || [];
  const missingSkills  = analysis.missingSkills || [];
  const extractedSkills= analysis.extractedSkills || [];
  const roadmap        = analysis.roadmap || [];
  const recs           = analysis.recommendations || {};

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Skill"
        gradient="Matrix"
        subtitle={`Competency analysis for ${analysis.jobRole} @ ${analysis.company}.`}
        badge={<Badge variant="success" icon={ShieldCheck}>AI Benchmarked</Badge>}
      />

      {/* ── METRIC HIGHLIGHT STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <GlassCard style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Keyword Match</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6366f1', margin: '0.25rem 0' }}>{analysis.keywordMatch}%</p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>JD Compatibility</p>
        </GlassCard>

        <GlassCard style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Matched Skills</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', margin: '0.25rem 0' }}>{matchedSkills.length}</p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Present on Resume</p>
        </GlassCard>

        <GlassCard style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Missing Skills</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f43f5e', margin: '0.25rem 0' }}>{missingSkills.length}</p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Deficits Identified</p>
        </GlassCard>

        <GlassCard style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Target Score</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', margin: '0.25rem 0' }}>{analysis.estimatedScoreAfterImprovements || analysis.careerReadiness}%</p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>After Roadmap Completion</p>
        </GlassCard>
      </div>

      {/* ── TAB SELECTOR ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('skills')}
          style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', background: activeTab === 'skills' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent', color: activeTab === 'skills' ? 'white' : '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Target size={16} /> Skill Breakdown
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', background: activeTab === 'roadmap' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent', color: activeTab === 'roadmap' ? 'white' : '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <BookOpen size={16} /> Learning Roadmap ({roadmap.length})
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', background: activeTab === 'recommendations' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent', color: activeTab === 'recommendations' ? 'white' : '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Sparkles size={16} /> Actionable Recommendations
        </button>
      </div>

      {/* ── TAB 1: SKILL BREAKDOWN ── */}
      {activeTab === 'skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          {/* Matched Skills */}
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#10b981' }}>
              <CheckCircle2 size={22} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>Matched Competencies ({matchedSkills.length})</h3>
            </div>
            {matchedSkills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {matchedSkills.map((skill, i) => (
                  <span key={i} style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.82rem', fontWeight: 700 }}>
                    ✓ {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No direct keyword matches found on your resume.</p>
            )}
          </GlassCard>

          {/* Missing Skills / Deficits */}
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#f43f5e' }}>
              <XCircle size={22} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>Missing Skills ({missingSkills.length})</h3>
            </div>
            {missingSkills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {missingSkills.map((skill, i) => (
                  <span key={i} style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', fontSize: '0.82rem', fontWeight: 700 }}>
                    ✗ {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>All key skills present! You match the target job description.</p>
            )}
          </GlassCard>

          {/* Extracted Skills List */}
          {extractedSkills.length > 0 && (
            <GlassCard style={{ gridColumn: '1 / -1', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Brain size={18} color="#6366f1" /> All Extracted Resume Skills ({extractedSkills.length})
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {extractedSkills.map((item, i) => {
                  const name = typeof item === 'string' ? item : item.skill;
                  return (
                    <span key={i} style={{ padding: '0.35rem 0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                      {name}
                    </span>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ── TAB 2: LEARNING ROADMAP ── */}
      {activeTab === 'roadmap' && (
        <GlassCard style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={22} color="#6366f1" />
            Step-by-Step Skill Upgrade Roadmap
          </h3>

          {roadmap.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {roadmap.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                  {/* Step index circle */}
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', flexShrink: 0 }}>
                    {step.step || idx + 1}
                  </div>

                  {/* Step content */}
                  <div style={{ flex: 1, padding: '1.25rem 1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white' }}>{step.phase || step.title || `Phase ${idx + 1}`}</h4>
                      {step.timeline && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                          {step.timeline}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {step.action || step.description}
                    </p>

                    {step.skillsToLearn && step.skillsToLearn.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {step.skillsToLearn.map((s, i) => (
                          <span key={i} style={{ fontSize: '0.72rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No custom roadmap generated yet.</p>
          )}
        </GlassCard>
      )}

      {/* ── TAB 3: RECOMMENDATIONS ── */}
      {activeTab === 'recommendations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          {/* Recommended Projects */}
          <GlassCard style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6366f1', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} /> Recommended Projects
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(recs.projects || []).map((proj, i) => (
                <div key={i} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
                  <p style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {typeof proj === 'string' ? proj : proj.title}
                  </p>
                  {typeof proj !== 'string' && proj.description && (
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{proj.description}</p>
                  )}
                </div>
              ))}
              {(!recs.projects || recs.projects.length === 0) && (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No specific projects recommended.</p>
              )}
            </div>
          </GlassCard>

          {/* Recommended Certifications */}
          <GlassCard style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} /> Recommended Certifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(recs.certifications || []).map((cert, i) => (
                <div key={i} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.12)' }}>
                  <p style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {typeof cert === 'string' ? cert : cert.name}
                  </p>
                  {typeof cert !== 'string' && cert.provider && (
                    <p style={{ fontSize: '0.8rem', color: '#f59e0b' }}>{cert.provider}</p>
                  )}
                </div>
              ))}
              {(!recs.certifications || recs.certifications.length === 0) && (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No specific certifications recommended.</p>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default SkillGap;
