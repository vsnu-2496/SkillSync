import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Brain,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, ProgressBar } from '../components/ui';

const SkillGap = () => {
  const [gaps, setGaps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const r = await api.get('/skills/matrix');
      if (r.data.success) {
        const data = r.data.skill_gaps;
        setGaps(data);
        setIsAnalyzed(r.data.isAnalyzed);
        
        // Handle selection logic
        const domainParam = new URLSearchParams(location.search).get('domain');
        if (domainParam) {
          const matched = data.find(g => g.domain.toLowerCase() === domainParam.toLowerCase());
          setSelected(matched || data[0]);
        } else {
          setSelected(data[0]);
        }
      }
    } catch (err) {
      console.error('Matrix Fetch Error:', err);
      setError("Neural matrix synchronization failed. Check your uplink.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [location.search]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column' }}>
      <div style={{ width: '45px', height: '45px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Calibrating Matrix...</p>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
    </div>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader 
        title="Skill" 
        gradient="Matrix" 
        subtitle="Current identifiers benchmarked against industry-standard career domain requirements." 
        badge={<Badge variant={isAnalyzed ? "success" : "warning"} icon={isAnalyzed ? ShieldCheck : Brain}>{isAnalyzed ? "Neural Sync Active" : "Heuristic Estimate"}</Badge>}
      />

      {error && (
        <GlassCard style={{ marginBottom: '2rem', border: '1px solid rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#f43f5e' }}>
            <AlertCircle size={20} />
            <p style={{ fontWeight: 700 }}>{error}</p>
          </div>
        </GlassCard>
      )}

      {/* Sync Banner - Always visible if not analyzed, but doesn't block the page */}
      {!isAnalyzed && !error && (
        <GlassCard style={{ marginBottom: '3rem', background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.05), transparent)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                <Zap size={28} />
              </div>
              <div>
                <h4 style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Upgrade to Neural Accuracy</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>The current matrix is a heuristic estimate based on your registration interests. Sync your resume for precision mapping.</p>
              </div>
            </div>
            <Link to="/resume" style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon={ArrowRight}>Initialize Analysis</Button>
            </Link>
          </div>
        </GlassCard>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        {/* Sidebar: Domain Selection */}
        <GlassCard style={{ height: 'fit-content', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>Target Domains</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {gaps.map((g) => (
              <button 
                key={g.domain} 
                onClick={() => setSelected(g)} 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: `1px solid ${selected?.domain === g.domain ? 'rgba(99, 102, 241, 0.2)' : 'transparent'}`, 
                  background: selected?.domain === g.domain ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.01)', 
                  color: selected?.domain === g.domain ? 'white' : '#64748b', 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  fontWeight: 700 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{g.domain}</span>
                  {selected?.domain === g.domain && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />}
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
        
        {/* Main Content: Domain Details */}
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{selected.domain}</h2>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>Role Synergy & Neural Alignment Audit</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <p style={{ fontSize: '3rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{selected.match_percent}%</p>
                   <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>Neural Alignment</p>
                </div>
              </div>
              <ProgressBar progress={selected.match_percent} height={8} />
            </GlassCard>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
               <GlassCard>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>Active Competencies</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {selected.required_skills.filter(s => !selected.missing_skills.includes(s)).length > 0 ? (
                      selected.required_skills.filter(s => !selected.missing_skills.includes(s)).map(s => <Badge key={s} variant="success">{s}</Badge>)
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>No primary nodes identified yet.</p>
                    )}
                  </div>
               </GlassCard>
               <GlassCard>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
                      <XCircle size={18} />
                    </div>
                    <span style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>Critical Deficits</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {selected.missing_skills.length > 0 ? (
                      selected.missing_skills.map(s => <Badge key={s} variant="danger">{s}</Badge>)
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800 }}>Domain Expertise Verified.</p>
                    )}
                  </div>
               </GlassCard>
            </div>

            <GlassCard style={{ border: '1px solid rgba(168, 85, 247, 0.2)', padding: '2.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                    <Brain size={40} />
                  </div>
                  <div style={{ flex: 1 }}>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Accelerate Synergy</h3>
                     <p style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5 }}>
                       {isAnalyzed 
                         ? `Neural logic has identified ${selected.priority_areas.length} critical optimization nodes. Resolve these to reach 90%+ alignment.`
                         : "Synchronize your professional manifest to receive a precision roadmap for this domain."
                       }
                     </p>
                  </div>
                  <Button 
                    variant="primary" 
                    icon={Zap} 
                    size="lg"
                    onClick={() => window.location.href = isAnalyzed ? '/interview-prep' : '/resume'}
                  >
                    {isAnalyzed ? "Optimize Profile" : "Start Sync"}
                  </Button>
               </div>
            </GlassCard>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <p style={{ color: '#64748b', fontWeight: 600 }}>Select a target domain to view analysis details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGap;
