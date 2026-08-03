import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import {
  ArrowRight,
  XCircle,
  TrendingUp,
  Cpu,
  Clock,
  Briefcase,
  Zap,
  DollarSign
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, ProgressBar } from '../components/ui';
import Modal from '../components/ui/Modal';

const CareerRecommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    api.get('/careers/recommendations')
      .then((r) => {
        if (r.data.success && Array.isArray(r.data.recommendations)) {
          setRecs(r.data.recommendations);
        } else {
          setRecs([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load career recommendations:", err);
        setRecs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column' }}>
        <div style={{ width: '45px', height: '45px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Architecting Solutions...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Career"
        gradient="Mapping"
        subtitle="Strategic career domains architected from your professional profile and neural benchmarks."
        badge={<Badge>Optimal Alignment Engaged</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
        {recs.length > 0 ? recs.map((rec, i) => (
          <motion.div key={rec.domain || i} whileHover={{ y: -5 }}>
            <GlassCard style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {i === 0 && (
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '0 0 0 16px' }}>
                  Primary Synergy
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: i === 0 ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i === 0 ? 'white' : 'var(--primary)' }}>
                  <Briefcase size={28} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confidence</p>
                  <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white' }}>{rec.confidence_score || 0}%</p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem' }}>{rec.domain}</h3>
              
              <div style={{ marginBottom: '2.5rem' }}>
                <ProgressBar progress={rec.confidence_score || 0} height={6} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Matched Nodes</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(rec.matched_skills || []).slice(0, 4).map(s => <Badge key={s} variant="success">{s}</Badge>)}
                    {(rec.matched_skills || []).length === 0 && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>None matched yet</span>}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Neural Gaps</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(rec.missing_skills || []).slice(0, 4).map(s => <Badge key={s} variant="danger">{s}</Badge>)}
                    {(rec.missing_skills || []).length === 0 && <span style={{ fontSize: '0.75rem', color: '#10b981' }}>No skill gaps identified</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                <Button variant="ghost" fullWidth onClick={() => { setSelectedCareer(rec); setModalType('audit'); }}>Audit Gaps</Button>
                <Button variant="primary" fullWidth icon={ArrowRight} onClick={() => { setSelectedCareer(rec); setModalType('roadmap'); }}>Engine</Button>
              </div>
            </GlassCard>
          </motion.div>
        )) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', margin: '0 auto 2rem' }}>
              <Cpu size={40} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Neural Matrix Incomplete</h3>
            <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 2rem' }}>Please initialize a neural analysis of your professional manifest to generate career mappings.</p>
            <Button variant="primary" icon={Zap} onClick={() => window.location.href = '/resume'}>Start Analysis</Button>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      <Modal 
        isOpen={selectedCareer && modalType === 'roadmap'} 
        onClose={() => setSelectedCareer(null)}
        title={selectedCareer?.domain}
        subtitle="Strategic career trajectories & learning milestones."
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {(selectedCareer?.roadmap || []).map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontWeight: 900 }}>{idx + 1}</div>
                   {idx < (selectedCareer?.roadmap || []).length - 1 && <div style={{ flex: 1, width: '2px', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.3), transparent)', marginTop: '0.5rem' }} />}
                </div>
                <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
                   <h4 style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>{step.phase}</h4>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {(step.topics || []).map(t => <Badge key={t} variant="primary" icon={Zap}>{t}</Badge>)}
                   </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <GlassCard hover={false} style={{ padding: '2rem', background: 'rgba(255,255,255,0.01)' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Metrics</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                   <MetricRow label="Estimate" value={selectedCareer?.estimated_time || "5-7 Months"} icon={Clock} />
                   <MetricRow label="Demand" value={selectedCareer?.market_demand || "High"} icon={TrendingUp} />
                   <MetricRow label="Salary" value={selectedCareer?.salary_range || "$95k - $145k"} icon={DollarSign} />
                </div>
             </GlassCard>
             <Button variant="primary" fullWidth size="lg" onClick={() => window.location.href = '/interview-prep'}>Initialize Journey</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={selectedCareer && modalType === 'audit'} 
        onClose={() => setSelectedCareer(null)}
        title="Audit Matrix"
        subtitle={`Deficit analysis for ${selectedCareer?.domain}`}
        sidePanel
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
             <p style={{ fontSize: '3rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{selectedCareer?.confidence_score || 0}%</p>
             <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Readiness Score</p>
             <div style={{ marginTop: '1.5rem' }}>
                <ProgressBar progress={selectedCareer?.confidence_score || 0} />
             </div>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Intelligence Gaps</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(selectedCareer?.missing_skills || []).map(s => <Badge key={s} variant="danger" icon={XCircle}>{s}</Badge>)}
            </div>
          </div>
          <GlassCard hover={false} style={{ border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#a855f7' }}>
              <Zap size={20} />
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Next Optimization Nodes</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(selectedCareer?.priority_steps || []).map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', fontWeight: 900 }}>{i + 1}</div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{step}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </Modal>
    </div>
  );
};

const MetricRow = ({ label, value, icon: Icon }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
       <Icon size={16} />
       <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</span>
    </div>
    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'white' }}>{value}</span>
  </div>
);

export default CareerRecommendations;
