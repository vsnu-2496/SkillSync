import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  BookOpen,
  Loader2,
  ArrowRight,
  Check,
  Cpu,
  Zap,
  ShieldCheck,
} from 'lucide-react';

const INTERESTS = [
  'Web Development',
  'Data Science',
  'Cloud Computing',
  'Mobile Development',
  'Software Testing',
  'UI/UX Design',
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    year: '1st Year',
    interests: [],
  });
  const [error, setError]           = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData((p) => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter((i) => i !== interest)
        : [...p.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Required nodes missing from registration manifest.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/resume');
    } catch (err) {
      setError(err.response?.data?.error || 'Account provisioning failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#020617' }}>
      
      {/* ── LEFT: BRANDING (Visible on LG) ── */}
      <div style={{ 
        flex: 1, 
        padding: '5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: 'radial-gradient(circle at bottom center, rgba(99, 102, 241, 0.08), transparent 60%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Sparkles size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', tracking: '-0.02em' }}>SkillSync AI</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '3.75rem', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.03em' }}>
            Join the Next<br />
            Gen of <span className="text-gradient">AI Experts</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 500, maxWidth: '460px', lineHeight: 1.6, marginBottom: '3.5rem' }}>
            Initialize your professional identity to begin receiving strategic career trajectories.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <FeatureItem icon={<Cpu size={20} />} title="Smart Extraction" desc="Neural resume parsing engine." />
            <FeatureItem icon={<Zap size={20} />} title="Path Mapping" desc="Dynamic carrier trajectories." />
            <FeatureItem icon={<ShieldCheck size={20} />} title="Secure Processing" desc="Your data, encrypted." />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.65rem', color: '#1e293b', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            GLOBAL IDENTITY PROTECTION ACTIVE
          </p>
        </div>
      </div>

      {/* ── RIGHT: FORM ── */}
      <div style={{ 
        width: '100%', 
        maxWidth: '850px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '5rem',
        backgroundColor: '#04091d',
        overflowY: 'auto'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Provision Account</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#6366f1', fontWeight: 800, textDecoration: 'none' }}>Initialize Sign In</Link>
            </p>
          </div>

          {error && (
            <div style={{ 
              marginBottom: '2rem', 
              padding: '1.25rem', 
              background: 'rgba(244, 63, 94, 0.05)', 
              border: '1px solid rgba(244, 63, 94, 0.15)', 
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f43f5e' }} />
              <p style={{ fontSize: '0.875rem', color: '#f43f5e', fontWeight: 700 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <FormField label="Full Name" icon={<User size={18} />}>
                <input name="name" type="text" required placeholder="Jane Doe"
                  value={formData.name} onChange={handleInput}
                  className="portal-input-field" />
              </FormField>

              <FormField label="Email address" icon={<Mail size={18} />}>
                <input name="email" type="email" required placeholder="jane@example.com"
                  value={formData.email} onChange={handleInput}
                  className="portal-input-field" />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <FormField label="Password" icon={<Lock size={18} />}>
                <input name="password" type="password" required placeholder="••••••••"
                  value={formData.password} onChange={handleInput}
                  className="portal-input-field" />
              </FormField>

              <FormField label="University" icon={<BookOpen size={18} />}>
                <input name="college" type="text" placeholder="Institution"
                  value={formData.college} onChange={handleInput}
                  className="portal-input-field" />
              </FormField>
            </div>

            <FormField label="Year Level">
              <select name="year" value={formData.year} onChange={handleInput} className="portal-input-field">
                {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </FormField>

            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', paddingLeft: '4px' }}>
                Interest Matrix
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {INTERESTS.map((interest) => {
                  const selected = formData.interests.includes(interest);
                  return (
                    <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: selected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.04)',
                        background: selected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        color: selected ? '#818cf8' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {selected && <Check size={12} />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ height: '56px', justifyContent: 'center', marginTop: '1.5rem' }}>
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={20} /><span>Provisioning...</span></>
              ) : (
                <><span>Create Account</span><ArrowRight size={20} /></>
              )}
            </button>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .portal-input-field {
          width: 100%;
          height: 52px;
          padding: 0 1.25rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          color: white;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .portal-input-field:focus {
          border-color: rgba(99, 102, 241, 0.4);
        }
      `}} />
    </div>
  );
};

const FormField = ({ label, icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {icon && React.cloneElement(icon, { 
        style: { 
          position: 'absolute', 
          left: '16px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: '#475569' 
        } 
      })}
      {React.cloneElement(children, { 
        style: { 
          ...children.props.style, 
          paddingLeft: icon ? '3.25rem' : '1.25rem' 
        } 
      })}
    </div>
  </div>
);

const FeatureItem = ({ icon, title, desc }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
      {icon}
    </div>
    <div>
      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', marginBottom: '0.15rem' }}>{title}</h4>
      <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{desc}</p>
    </div>
  </div>
);

export default Register;
