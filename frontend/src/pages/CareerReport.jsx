/**
 * CareerReport.jsx — Career Readiness Report Page
 * ─────────────────────────────────────────────────────────────────────
 * The full career readiness dashboard after AI analysis.
 * 
 * Sections:
 *  1. Hero — Career Readiness circular score + tier + company/role
 *  2. Score Breakdown — 4 expandable category cards (25% each)
 *  3. Explainable AI — whyThisScore with ✓/✗ bullet points
 *  4. Keyword Match — matched vs missing skill chips
 *  5. Recommendations — projects, internships, certs, skills tabs
 *  6. Career Roadmap — timeline steps
 *  7. Future Score — before/after comparison bars
 *  8. History — last 5 analyses for comparison
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Brain, Target, BookOpen, Award, Briefcase, Star,
  CheckCircle2, XCircle, ArrowRight, ArrowLeft, Rocket,
  TrendingUp, AlertTriangle, Map, Lightbulb, History,
  ChevronRight, RefreshCw, Home, Zap, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';
import api from '../api/axiosConfig';
import PageHeader from '../components/layout/PageHeader';
import {
  GlassCard, Badge, Button, CircularProgress,
  SkillChip, ExpandableCard, Skeleton, ScoreBar, ProgressBar
} from '../components/ui';

// ─── Tab Config for Recommendations ───────────────────────────────────
const REC_TABS = [
  { id: 'projects', label: 'Projects', icon: Briefcase, color: '#6366f1' },
  { id: 'internships', label: 'Internships', icon: Building2, color: '#a855f7' },
  { id: 'certifications', label: 'Certifications', icon: Award, color: '#f59e0b' },
  { id: 'skills', label: 'Skills', icon: Zap, color: '#10b981' },
];

// ─── Tier colors ─────────────────────────────────────────────────────
const getTierColor = (score) => {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#6366f1';
  if (score >= 55) return '#f59e0b';
  return '#f43f5e';
};

// ─── Main Component ───────────────────────────────────────────────────
const CareerReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [activeRecTab, setActiveRecTab] = useState('projects');
  const navigate = useNavigate();

  useEffect(() => {
    // Load from sessionStorage (set by ResumeUpload after analysis)
    const stored = sessionStorage.getItem('careerAnalysis');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse analysis data');
      }
    }
    setLoading(false);

    // Load history for comparison
    api.get('/resume/history')
      .then(res => { if (res.data.success) setHistory(res.data.data || []); })
      .catch(() => {});
  }, []);

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('careerAnalysis');
    navigate('/resume');
  };

  // ── Loading State ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-fade-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton height="200px" borderRadius="24px" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Skeleton height="160px" borderRadius="24px" />
            <Skeleton height="160px" borderRadius="24px" />
          </div>
          <Skeleton height="300px" borderRadius="24px" />
        </div>
      </div>
    );
  }

  // ── No Data State ──────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="animate-fade-up" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
        <GlassCard hover={false}>
          <div style={{ padding: '3rem' }}>
            <Brain size={56} color="#475569" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>
              No Analysis Found
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Upload your resume and select a company to generate your career readiness report.
            </p>
            <Link to="/resume">
              <Button variant="primary" icon={ArrowRight}>Start Analysis</Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  const tierColor = data.readinessColor || getTierColor(data.careerReadiness);
  const tierLabel = data.readinessTier || 'Analyzed';

  // ── Radar chart data from sub-scores ──────────────────────────────
  const radarData = [
    { subject: 'Interest', A: Math.round((data.interestScore / 25) * 100) },
    { subject: 'Projects', A: Math.round((data.projectScore / 25) * 100) },
    { subject: 'Internship', A: Math.round((data.internshipScore / 25) * 100) },
    { subject: 'Certs', A: Math.round((data.certificationScore / 25) * 100) },
    { subject: 'Keywords', A: data.keywordMatch || 0 },
    { subject: 'ATS', A: data.atsScore || 0 },
  ];

  return (
    <div className="animate-fade-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ marginBottom: '0.75rem' }}>
            <Badge icon={Brain}>AI Career Report</Badge>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Career <span className="text-gradient">Readiness Report</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            {data.targetCompany && data.targetRole
              ? `${data.targetRole} at ${data.targetCompany}`
              : 'Personalized AI analysis'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleNewAnalysis}>New Analysis</Button>
          <Link to="/dashboard"><Button variant="ghost" size="sm" icon={Home}>Dashboard</Button></Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Hero Score Card                                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <GlassCard
        hover={false}
        style={{
          marginBottom: '1.5rem',
          background: `linear-gradient(135deg, rgba(15,23,42,0.8), rgba(15,23,42,0.6))`,
          border: `1px solid ${tierColor}25`,
          boxShadow: `0 0 60px ${tierColor}10`
        }}
      >
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Circular score */}
          <div style={{ flexShrink: 0 }}>
            <CircularProgress
              score={data.careerReadiness}
              size={180}
              strokeWidth={12}
              color={tierColor}
              label="Career Readiness"
              sublabel={tierLabel}
            />
          </div>

          {/* Right info */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{
                padding: '0.3rem 0.875rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800,
                background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}30`,
                textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>
                {tierLabel}
              </span>
              {data.readinessEmoji && (
                <span style={{ fontSize: '1.25rem' }}>{data.readinessEmoji}</span>
              )}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>
              {data.targetRole}
              {data.targetCompany && (
                <span style={{ color: '#818cf8' }}> @ {data.targetCompany}</span>
              )}
            </h2>

            {/* Quick stats row */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <QuickStat label="ATS Score" value={`${data.atsScore}%`} color="#10b981" />
              <QuickStat label="Keyword Match" value={`${data.keywordMatch}%`} color="#6366f1" />
              <QuickStat label="Skills Matched" value={data.matchedSkills?.length || 0} color="#f59e0b" />
              <QuickStat label="Skills Missing" value={data.missingSkills?.length || 0} color="#f43f5e" />
            </div>
          </div>

          {/* Right radar chart */}
          <div style={{ width: '200px', height: '180px', flexShrink: 0, display: 'none' }} className="radar-hero">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                <Radar dataKey="A" stroke={tierColor} fill={tierColor} fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Career Readiness Score Breakdown (4 categories)   */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <GlassCard hover={false} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Target size={20} color="#6366f1" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white' }}>Career Readiness Breakdown</h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.825rem', fontWeight: 500, marginBottom: '1.75rem' }}>
          Click any category to see the explanation and improvement tips.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <ExpandableCard
            title="Area of Interest"
            icon={Star}
            score={data.interestScore}
            maxScore={25}
            color="#6366f1"
            explanation={data.interestExplanation}
            improvement={data.recommendations?.skills?.slice(0, 2).map(s => `• Learn ${s}`).join('\n') || 'Deepen expertise in your target domain.'}
          />
          <ExpandableCard
            title="Projects"
            icon={Briefcase}
            score={data.projectScore}
            maxScore={25}
            color="#a855f7"
            explanation={data.projectExplanation}
            improvement={data.recommendations?.projects?.slice(0, 2).join('\n• ') || 'Build more industry-relevant projects.'}
          />
          <ExpandableCard
            title="Internships"
            icon={Building2}
            score={data.internshipScore}
            maxScore={25}
            color="#f59e0b"
            explanation={data.internshipExplanation}
            improvement={data.recommendations?.internships?.slice(0, 2).join('\n• ') || 'Apply for internships on Internshala and LinkedIn.'}
          />
          <ExpandableCard
            title="Certifications"
            icon={Award}
            score={data.certificationScore}
            maxScore={25}
            color="#10b981"
            explanation={data.certificationExplanation}
            improvement={data.recommendations?.certifications?.slice(0, 2).join('\n• ') || 'Earn industry-recognized certifications.'}
          />
        </div>
      </GlassCard>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — Explainable AI: Why This Score                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <GlassCard hover={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Brain size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'white' }}>Why This Score?</h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.8, fontWeight: 500, marginBottom: '1.5rem' }}>
            {data.whyThisScore}
          </p>

          {/* Strengths */}
          {data.strengths?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                ✓ Strengths
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 size={14} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {data.weaknesses?.length > 0 && (
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                ✗ Gaps Identified
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <XCircle size={14} color="#f43f5e" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5 }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* ─ Keyword Match ─ */}
        <GlassCard hover={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Zap size={20} color="#f59e0b" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'white' }}>Keyword Match Analysis</h2>
          </div>

          {/* Circular keyword match */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <CircularProgress
              score={data.keywordMatch}
              size={110}
              strokeWidth={9}
              color={getTierColor(data.keywordMatch)}
              label="Keyword Match"
            />
          </div>

          {/* Matched skills */}
          {data.matchedSkills?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                Matched ({data.matchedSkills.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {data.matchedSkills.slice(0, 12).map(skill => (
                  <SkillChip key={skill} skill={skill} type="matched" />
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {data.missingSkills?.length > 0 && (
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                Missing ({data.missingSkills.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {data.missingSkills.slice(0, 12).map(skill => (
                  <SkillChip key={skill} skill={skill} type="missing" />
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — Recommendations (tabbed)                          */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <GlassCard hover={false} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Lightbulb size={20} color="#f59e0b" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white' }}>Personalized Recommendations</h2>
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {REC_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveRecTab(tab.id)}
              style={{
                padding: '0.5rem 1.125rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
                border: activeRecTab === tab.id ? `2px solid ${tab.color}` : '1px solid rgba(255,255,255,0.06)',
                background: activeRecTab === tab.id ? `${tab.color}12` : 'rgba(255,255,255,0.02)',
                color: activeRecTab === tab.id ? tab.color : '#64748b'
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRecTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {(data.recommendations?.[activeRecTab] || []).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
                {data.recommendations[activeRecTab].map((item, i) => {
                  const tab = REC_TABS.find(t => t.id === activeRecTab);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        padding: '1.125rem', borderRadius: '16px',
                        background: `${tab.color}06`, border: `1px solid ${tab.color}20`,
                        display: 'flex', alignItems: 'flex-start', gap: '0.875rem'
                      }}
                    >
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: `${tab.color}15`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: tab.color, flexShrink: 0, marginTop: '1px'
                      }}>
                        <tab.icon size={14} />
                      </div>
                      <p style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1.6 }}>{item}</p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>
                No recommendations available for this category.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </GlassCard>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — Career Roadmap                                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {data.roadmap?.length > 0 && (
        <GlassCard hover={false} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <Map size={20} color="#a855f7" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white' }}>Career Roadmap</h2>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Vertical timeline line */}
            <div style={{
              position: 'absolute', left: '17px', top: '8px', bottom: '8px',
              width: '2px', background: 'linear-gradient(to bottom, #6366f1, #a855f7, #6366f130)'
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {data.roadmap.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}
                >
                  {/* Node */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(99,102,241,0.1)',
                    border: `2px solid ${i === 0 ? '#6366f1' : 'rgba(99,102,241,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: i === 0 ? 'white' : '#6366f1', fontWeight: 800, fontSize: '0.8rem',
                    zIndex: 1
                  }}>
                    {i + 1}
                  </div>
                  {/* Content */}
                  <div style={{
                    flex: 1, padding: '0.875rem 1.125rem', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)',
                    marginTop: '4px'
                  }}>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, lineHeight: 1.6 }}>{step}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — Current vs Estimated Future Score                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {data.estimatedScoreAfterImprovements > 0 && (
        <GlassCard hover={false} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <TrendingUp size={20} color="#10b981" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white' }}>Your Growth Potential</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
            {/* Current */}
            <div style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Current Score</p>
              <p style={{ fontSize: '3rem', fontWeight: 900, color: getTierColor(data.careerReadiness) }}>
                {data.careerReadiness}%
              </p>
              <p style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, marginTop: '0.25rem' }}>{data.readinessTier || 'Current Level'}</p>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowRight size={24} color="#6366f1" />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                After<br />Improvements
              </span>
            </div>

            {/* Future */}
            <div style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '20px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Estimated Score</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981' }}
              >
                {data.estimatedScoreAfterImprovements}%
              </motion.p>
              <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '0.25rem' }}>
                +{data.estimatedScoreAfterImprovements - data.careerReadiness} points potential
              </p>
            </div>
          </div>

          {/* Progress comparison bars */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Current</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800 }}>{data.careerReadiness}%</span>
              </div>
              <ProgressBar progress={data.careerReadiness} height={10} color={getTierColor(data.careerReadiness)} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Estimated after improvements</span>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>{data.estimatedScoreAfterImprovements}%</span>
              </div>
              <ProgressBar progress={data.estimatedScoreAfterImprovements} height={10} color="#10b981" />
            </div>
          </div>
        </GlassCard>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — Analysis History (Comparison)                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {history.length > 1 && (
        <GlassCard hover={false} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <History size={20} color="#64748b" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'white' }}>Analysis History</h2>
            </div>
            <Badge variant="ghost">{history.length} analyses</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.slice(0, 5).map((h, i) => (
              <motion.div
                key={h._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  padding: '1rem 1.25rem', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'white' }}>
                    {h.jobRole} @ {h.company}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                    {new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 900, color: getTierColor(h.careerReadiness) }}>{h.careerReadiness}%</p>
                    <p style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Readiness</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6366f1' }}>{h.atsScore}%</p>
                    <p style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>ATS</p>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => {
                      api.get(`/resume/history/${h._id}`)
                        .then(res => {
                          if (res.data.success) {
                            sessionStorage.setItem('careerAnalysis', JSON.stringify(res.data.data));
                            window.location.reload();
                          }
                        })
                        .catch(console.error);
                    }}
                  >
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Bottom CTA */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingBottom: '2rem', flexWrap: 'wrap' }}>
        <Button variant="ghost" icon={RefreshCw} onClick={handleNewAnalysis}>Analyze Another Resume</Button>
        <Link to="/dashboard"><Button variant="primary" icon={Rocket}>Go to Dashboard</Button></Link>
      </div>

    </div>
  );
};

// ─── Helper sub-components ────────────────────────────────────────────
const QuickStat = ({ label, value, color }) => (
  <div>
    <p style={{ fontSize: '1.375rem', fontWeight: 900, color }}>{value}</p>
    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
  </div>
);

export default CareerReport;
