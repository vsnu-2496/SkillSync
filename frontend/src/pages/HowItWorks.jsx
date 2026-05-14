import React from 'react';
import { 
  Cpu, 
  Search, 
  Target, 
  Map, 
  CheckCircle2, 
  GraduationCap, 
  Briefcase, 
  TrendingUp,
  Fingerprint,
  Zap
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Badge, Button } from '../components/ui';

const HowItWorks = () => {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="System"
        gradient="Intelligence"
        subtitle="Understand the neural architecture behind SkillSync AI and how it transforms your professional trajectory."
        badge={<Badge variant="primary" icon={Cpu}>Architecture v2.0</Badge>}
      />

      {/* ── SECTION: HOW IT WORKS (THE PROCESS) ── */}
      <div style={{ marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', textAlign: 'center', marginBottom: '3.5rem' }}>
          The Neural <span className="text-gradient">Pipeline</span>
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <ProcessStep 
            number="01"
            icon={<Fingerprint size={32} />}
            title="Manifest Ingestion"
            desc="Upload your PDF resume. Our system creates a professional 'DNA Manifest' by scanning your entire career history."
            color="#6366f1"
          />
          <ProcessStep 
            number="02"
            icon={<Search size={32} />}
            title="Deep Skill Parsing"
            desc="Our algorithms identify technical markers, core competencies, and hidden skills using frequency-weighted neural logic."
            color="#a855f7"
          />
          <ProcessStep 
            number="03"
            icon={<Target size={32} />}
            title="Synergy Benchmark"
            desc="Your skills are benchmarked against live industry standards to calculate your Career Synergy and Match percentages."
            color="#ec4899"
          />
          <ProcessStep 
            number="04"
            icon={<Map size={32} />}
            title="Roadmap Generation"
            desc="The system identifies critical deficits and generates a personalized training path to bridge the gap to your target role."
            color="#10b981"
          />
        </div>
      </div>

      {/* ── SECTION: WHERE IT HELPS ── */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '40px', padding: '5rem 2rem', border: '1px solid rgba(255,255,255,0.03)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', textAlign: 'center', marginBottom: '4rem' }}>
          Impact <span className="text-gradient">Vectors</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
          <ImpactCard 
            icon={<GraduationCap size={40} />}
            title="For Students"
            points={[
              "Identify the best career domain based on current strengths.",
              "Get a clear list of exactly what skills to learn next.",
              "Prepare for interviews with company-specific intelligence.",
              "Build confidence through data-driven readiness scores."
            ]}
          />
          <ImpactCard 
            icon={<Briefcase size={40} />}
            title="For Professionals"
            points={[
              "Benchmark your current market value against industry standards.",
              "Identify transition paths into higher-tier roles.",
              "Optimize your professional profile for better visibility.",
              "Understand 'Senior Level' requirements before applying."
            ]}
          />
        </div>
      </div>

      {/* ── CTA SECTION ── */}
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem' }}>Ready to Sync?</h3>
          <p style={{ color: '#64748b', fontSize: '1.125rem', marginBottom: '2.5rem' }}>Start your neural analysis today and take the guesswork out of your career trajectory.</p>
          <Button variant="primary" size="lg" icon={Zap}>Initialize Your Sync</Button>
        </div>
      </div>
    </div>
  );
};

const ProcessStep = ({ number, icon, title, desc, color }) => (
  <GlassCard style={{ padding: '2.5rem', height: '100%', position: 'relative', overflow: 'hidden' }}>
    <div style={{ fontSize: '5rem', fontWeight: 900, color: 'rgba(255,255,255,0.02)', position: 'absolute', top: '-10px', right: '10px' }}>{number}</div>
    <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, marginBottom: '2rem' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>{title}</h3>
    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500 }}>{desc}</p>
  </GlassCard>
);

const ImpactCard = ({ icon, title, points }) => (
  <div style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)' }}>
    <div style={{ color: 'var(--primary)', marginBottom: '2rem' }}>{icon}</div>
    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '2rem' }}>{title}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {points.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <CheckCircle2 size={20} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
          <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 }}>{p}</p>
        </div>
      ))}
    </div>
  </div>
);

export default HowItWorks;
