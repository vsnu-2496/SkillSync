import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  BookOpen,
  Award,
  ExternalLink,
  Terminal,
  Layers,
  ChevronRight,
  Monitor,
  Zap,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button } from '../components/ui';

const CourseRecommendations = () => {
  const [courses,    setCourses]    = useState([]);
  const [domainInfo, setDomainInfo] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const location = useLocation();

  useEffect(() => {
    const domain = new URLSearchParams(location.search).get('domain');
    api.get(`/courses/recommendations${domain ? `?domain=${encodeURIComponent(domain)}` : ''}`)
      .then((r) => {
        setCourses(r.data.recommendations);
        setDomainInfo({ name: r.data.domain, missing: r.data.missing_skills });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [location.search]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Building Path...</p>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    );
  }

  if (!courses.length && !loading) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Training" gradient="Path" subtitle="Calibrating your learning roadmap based on global trends." />
        <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
           <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', margin: '0 auto 2rem' }}>
              <Layers size={40} />
           </div>
           <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>No Neural Gaps Detected</h3>
           <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 2rem', fontWeight: 500 }}>Your current skill manifest is aligned with this domain. Explore advanced certifications to maintain your edge.</p>
           <Button variant="primary" icon={Zap} onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Training"
        gradient="Path"
        subtitle={
          domainInfo?.name
            ? `Curated learning nodes architected to bridge deficits for ${domainInfo.name}.`
            : 'Curated knowledge resources tailored to your skill matrix.'
        }
        badge={<span className="badge">Curated Learning</span>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '2rem', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
          <Terminal size={32} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', marginBottom: '0.4rem' }}>Synthesize Practical Evidence</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 }}>
            Recruiters prioritize demonstrated competence. Implement <span style={{ color: '#818cf8', fontWeight: 700 }}>one practical project node</span> per target skill to validate your synergy.
          </p>
        </div>
        <button className="btn-primary">
          <span>Project Lab</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const CourseCard = ({ course }) => {
  const isCert = course.type === 'certification';
  
  return (
    <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', height: '100%', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: isCert ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: isCert ? '0 8px 20px rgba(245, 158, 11, 0.2)' : '0 8px 20px rgba(99, 102, 241, 0.2)'
        }}>
          {isCert ? <Award size={20} /> : <BookOpen size={20} />}
        </div>
        <span className="badge" style={{ fontSize: '0.65rem' }}>{course.level}</span>
      </div>

      <div style={{ flex: 1, marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</h3>
        <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
          {course.description || `Architect proficiency in ${course.skill_covered} via structured curriculum on ${course.platform}.`}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={12} color="#6366f1" />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target: {course.skill_covered}</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Platform</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>{course.platform}</span>
        </div>
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', height: '44px', background: 'white', color: '#020617' }}
        >
          <span>Aquire Node</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default CourseRecommendations;
